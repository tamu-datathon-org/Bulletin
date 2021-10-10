import { Button, Input, Radio, Spacer, Select, useToasts, Text } from "@geist-ui/react";
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
  challengeIds: Array<string>,
  videoLink: string,
  answer1: string,
  answer2: string,
  answer3: string,
  answer4: string,
  answer5: string,
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
    const submissionDataHandler = (e:any) => setSubmission((prev:any) => (
      {
        ...prev,
        [e.target.id]: ((e.target.id === "name" || e.target.id === "videoLink") ? e.target.value : e.target.value.split(','))
      }));

    const [editable, setEditable] = useState(false);
    const handleEditButton = () => {
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
        axios.post(`${BASE_URL}/api/${curEventId}/submission/add`, {
          name: `New Submission created at ${date_string}`,
          discordTags: ['default'],
          videoLink: "dummylink",
          challengeIds: []
        })
        .then(res => {
          sendNotification("Added new submission!", "success");
        })
        .catch(res => {
          sendNotification(String(res.response.data.error), "error");
        })
      } else {
        setSubmissionId((val as string));
      }
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
      <Text>{JSON.stringify(submission)}</Text>
        <Spacer h={1}/>
        <Input width="100%" label="Name" disabled={!editable} value={submission?.name} id="name" onChange={submissionDataHandler}/>
        <Spacer h={1}/>
        <Input width="100%" label="Tags" disabled={!editable} value={submission?.tags?.join()} id="tags" onChange={submissionDataHandler}/>
        <Spacer h={1}/>
        <Input width="100%" label="Links" disabled={!editable} value={submission?.links?.join()} id="links" onChange={submissionDataHandler}/>
        <Spacer h={1}/>
        <Input width="100%" label="Discord Tags" disabled={!editable} value={submission?.discordTags?.join()} id="discordTags" onChange={submissionDataHandler}/>
        <Spacer h={1}/>
        <Input width="100%" label="Video Link" disabled={!editable} value={submission?.videoLink} id="videoLink" onChange={submissionDataHandler}/>
        <Spacer h={1}/>
        <Text>Select a challenge to submit this project to:</Text>
        <Radio.Group useRow disabled={!editable} value={submission?.challengeIds?.at(0)} onChange={(c:any) => setSubmission((prev:any) => ({...prev, challengeIds: [c]}))}>
          {allChalleges.map(challenge => <Radio key={challenge._id} value={challenge._id}>{challenge.name}</Radio>)}
        </Radio.Group>
        <Text>{JSON.stringify(submission?.challengeIds?.at(0))}</Text>
        <Spacer h={1}/>
        {allChalleges.filter(challenge => challenge._id === submission?.challengeIds?.at(0)).map(challenge =>
            <>
              {challenge.question1 && <Input width="100%" label={challenge?.question1} disabled={!editable} value={submission?.answer1} key="answer1" id="answer1" onChange={submissionDataHandler}/>}
              {challenge.question2 && <Input width="100%" label={challenge?.question2} disabled={!editable} value={submission?.answer2} key="answer2" id="answer2" onChange={submissionDataHandler}/>}
              {challenge.question3 && <Input width="100%" label={challenge?.question3} disabled={!editable} value={submission?.answer3} key="answer3" id="answer3" onChange={submissionDataHandler}/>}
              {challenge.question4 && <Input width="100%" label={challenge?.question4} disabled={!editable} value={submission?.answer4} key="answer4" id="answer4" onChange={submissionDataHandler}/>}
              {challenge.question5 && <Input width="100%" label={challenge?.question5} disabled={!editable} value={submission?.answer5} key="answer5" id="answer5" onChange={submissionDataHandler}/>}
            </>
        )}
        <Button onClick={handleEditButton}>{editable ? "Update" : "Edit"}</Button>      
        </>
      }
    </>
    );
};