import { Button, Card, Divider, Input, Radio, Spacer, Select, useToasts, Text } from "@geist-ui/react";
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
    const submissionDataHandler = (e:any) => setSubmission((prev:any) => (
      {
        ...prev,
        [e.target.id]: ((e.target.id === "name" || e.target.id === "videoLink") ? e.target.value : e.target.value.split(','))
      }));

      const emptyCurSubmission = () => setSubmission({
        _id: "",
        name: "",
        tags: [],
        links: [],
        discordTags: [],
        challengeIds: [],
        videoLink: "",
        answer1: "",
        answer2: "",
        answer3: "",
        answer4: "",
        answer5: "",
      })

    const handleUpdateSubmission = () => {
      axios.post(`${BASE_URL}/api/${curEventId}/submission/add`, submission)
      .then(() => {
        sendNotification("Updated submission!", "success")
        emptyCurSubmission();
      })
      .catch(res => {
        sendNotification(String(res.response.data.error), "error");
      })};

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

    const handleEditSubmission = (id:string) => {
      axios.get<SubmissionResponse>(`${BASE_URL}/api/${curEventId}/submission/${id}`)
      .then(res => setSubmission(res.data.result));
    }

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

    return (
    <>
      <Select placeholder="Select an Event" onChange={val => setCurEventId((val as string))}>
        {eventList.map(event => {
          return <Select.Option key={event._id} value={event._id}>{event.name}</Select.Option>
        })}
      </Select>
      <Spacer h={1}/>
      {curEventId &&
      <Card>
        <Card.Content>
        <Text b>Add/Update a Submission</Text>
        </Card.Content>
        <Divider />
        <Card.Content>
        <Input width="100%" key="name" label="Name" value={submission?.name} id="name" onChange={submissionDataHandler}/>
        <Spacer h={1}/>
        <Input width="100%" key="tags" label="Tags" value={submission?.tags?.join()} id="tags" onChange={submissionDataHandler}/>
        <Spacer h={1}/>
        <Input width="100%" key="links" label="Links" value={submission?.links?.join()} id="links" onChange={submissionDataHandler}/>
        <Spacer h={1}/>
        <Input width="100%" key="discordtags" label="Discord Tags" value={submission?.discordTags?.join()} id="discordTags" onChange={submissionDataHandler}/>
        <Spacer h={1}/>
        <Input width="100%" key="videolink" label="Video Link" value={submission?.videoLink} id="videoLink" onChange={submissionDataHandler}/>
        <Spacer h={1}/>
        <Text>Select a challenge to submit this project to:</Text>
        <Radio.Group useRow value={submission?.challengeIds?.at(0)} onChange={(c:any) => setSubmission((prev:any) => ({...prev, challengeIds: [c]}))}>
          {allChalleges.map(challenge => <Radio key={challenge._id} value={challenge._id}>{challenge.name}</Radio>)}
        </Radio.Group>
        <Spacer h={1}/>
        {allChalleges.filter(challenge => challenge._id === submission?.challengeIds?.at(0)).map(challenge =>
            <>
              {challenge.question1 && <Input width="100%" label={challenge?.question1} value={submission?.answer1} key="answer1" id="answer1" onChange={submissionDataHandler}/>}
              {challenge.question2 && <Input width="100%" label={challenge?.question2} value={submission?.answer2} key="answer2" id="answer2" onChange={submissionDataHandler}/>}
              {challenge.question3 && <Input width="100%" label={challenge?.question3} value={submission?.answer3} key="answer3" id="answer3" onChange={submissionDataHandler}/>}
              {challenge.question4 && <Input width="100%" label={challenge?.question4} value={submission?.answer4} key="answer4" id="answer4" onChange={submissionDataHandler}/>}
              {challenge.question5 && <Input width="100%" label={challenge?.question5} value={submission?.answer5} key="answer5" id="answer5" onChange={submissionDataHandler}/>}
            </>
        )}
        <Spacer h={1}/>
        <Button onClick={handleUpdateSubmission}>{submission?._id ? "Update" : "Add"}</Button>    
        </Card.Content>
      </Card>
      }
      <Spacer h={0.5}/>
      {submissions.filter(submission => (submission && submission._id)).map(submission => (
          <React.Fragment key={submission._id}>
            <Card>
              <Text>{submission.name}</Text>
              <Button auto scale={0.5} value={submission._id} onClick={() => handleEditSubmission(submission._id)}>Edit</Button>
            </Card>
            <Spacer h={0.5}/>
          </React.Fragment>
        )
      )}
    </>
    );
};