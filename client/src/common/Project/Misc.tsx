import { Button, Input, Textarea, Spacer, Select, useToasts, Checkbox, Text } from "@geist-ui/react";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../../constants";
import { Event, ChallengesResponse, Challenge, EventsResponse } from '../Admin/Misc';

export interface Submission {
  _id: string,
  name: string,
  tags: Array<string>,
  links: Array<string>,
  discordTags: Array<string>,
  challenges: Array<string>,
}

interface SubmissionResponse {
    result: Submission;
}

interface SubmissionsResponse {
  result: Submission[];
}

export const ProjectPage: React.FC = () => {
    const [, setToast] = useToasts();
    const sendNotification = (msg:string, intent: any) => {
        setToast({ text: msg, type: intent, delay: 8000 });
      };

    // TODO: Get this from UserAuthProvider
    const userAuthId = "5efc0b99a37c4300032acbce"
    
    const [curEventId, setCurEventId] = useState<string>("");
    const [submissionId, setSubmissionId] = useState<string>("");

    const [allChalleges, setAllChallenges] = useState<Challenge[]>([])
    useEffect(() => {
      let mounted = true;
      if (curEventId) {
        axios.get<ChallengesResponse>(`${BASE_URL}/api/${curEventId}/challenge`)
        .then(res => {
          if (mounted) {
            setAllChallenges(res.data.result)
          }
        })
      }
      return () => {
        mounted = false;
      }
    },[curEventId])
    const [selectedChallengeIds, setSelectedChallengeIds] = useState<string[]>([]);

    const [submission, setSubmission] = useState<Submission>();
    useEffect(() => {
      let mounted = true
      if (curEventId) {
        axios.get<SubmissionResponse>(`${BASE_URL}/api/${curEventId}/submission/${submissionId}`)
        .then(res => {
          if (mounted) {
            setSubmission(res.data.result)
          }
        });
      }
      return () => {
        mounted = false
      }
    }, [curEventId, submissionId])
    const submissionDataHandler = (e:any) => setSubmission((prev:any) => ({...prev, [e.target.id]: (e.target.id === "name" ? e.target.value : e.target.value.split(','))}));

    const [editable, setEditable] = useState(false);
    const handleEditButton = () => {
      setSubmission((prev:any) => ({...prev, "challenges": selectedChallengeIds}))
      setEditable(prev => {
        if (prev) {
          axios.post(`${BASE_URL}/api/${curEventId}/submission/add`, submission)
          .then(() => sendNotification("Updated submission!", "success"))
          .catch(res => {
            sendNotification(String(res.response.data.error), "error");
          })
        }
        return !prev
      });
    }

    const [eventList, setEventList] = useState<Event[]>([]);
    useEffect(() => {
      let mounted = true
      axios.get<EventsResponse>(`${BASE_URL}/api/events`)
      .then(res => {
        if (mounted) {
          setEventList(res.data.result)
        }
      });
      return () => {
        mounted = false
      }
    },[]);

    const [submissions, setSubmissions] = useState<Submission[]>([])
    useEffect(() => {
      let mounted = true
      if (curEventId && userAuthId) {
        axios.get<SubmissionsResponse>(`${BASE_URL}/api/${curEventId}/submission/user/${userAuthId}`)
        .then(res => {
          if (mounted) {
            setSubmissions(res.data.result)
          }
        })
      }
      return () => {
        mounted = false
      }
    },[curEventId])

    const setSubmissionHandler = (val:any) => {
      if (val === "create_new_submission") {
        const date_string = new Date().toISOString();
        axios.post(`${BASE_URL}/api/${curEventId}/submission/add/${userAuthId}`, {
          name: `New Submission created at ${date_string}`,
          discordTags: ['default']
        })
        .then(res => {
          sendNotification("Added new submission!", "success");
        })
        .catch(res => {
          sendNotification(String(res.response.data.error), "error");
        })
      }
      setSubmissionId((val as string));
    };

    return (
    <>
      <Select placeholder="Select an Event" onChange={val => setCurEventId((val as string))}>
        {eventList.map(event => {
          return <Select.Option key={event._id} value={event._id}>{event.name}</Select.Option>
        })}
      </Select>
      <Spacer h={1}/>
      <Select placeholder="Add/Select a Submission" onChange={setSubmissionHandler}>
        <Select.Option value="create_new_submission">Create a new submission</Select.Option>
        <Select.Option divider />
        {submissions.filter(submission => (submission && submission._id))
        .map(submission => (
          <Select.Option key={submission._id} value={submission._id}>{submission.name}</Select.Option>
        ))}
      </Select>
      {curEventId && submissionId &&
      <>
        <Spacer h={1}/>
        <Input width="100%" label="Name" disabled={!editable} value={submission?.name} id="name" onChange={submissionDataHandler}/>
        <Spacer h={1}/>
        <Input width="100%" label="Discord Tags" disabled={!editable} value={submission?.discordTags?.join()} id="discordTags" onChange={submissionDataHandler}/>
        <Spacer h={1}/>
        <Text>Select challenge(s) to submit this project to:</Text>
        <Checkbox.Group value={[]} onChange={val => setSelectedChallengeIds(val)}>
          {allChalleges.map(challenge => <Checkbox value={challenge._id}>{challenge.name}</Checkbox>)}
        </Checkbox.Group>
        <Spacer h={1}/>
        {selectedChallengeIds.length > 0 &&
          <>
          <Text>Challenge Specific Questions</Text>
          {
            allChalleges.reduce((acc: string[], cur) => {
              if (selectedChallengeIds.indexOf(cur._id) > -1) acc.push(...cur.questions)
              return acc
            }, []).map(id => <li>{id}</li>)
          }
        <Spacer h={1}/>
        <Textarea placeholder="Answer all of the questions above." />
        <Spacer h={1}/>
        <Button onClick={handleEditButton}>{editable ? "Update" : "Edit"}</Button>
          </>
        }
        </>
      }
    </>
    );
};