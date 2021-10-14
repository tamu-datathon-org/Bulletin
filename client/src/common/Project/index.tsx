import { Button, Link, Card, Divider, Input, Radio, Spacer, Select, useToasts, Text } from "@geist-ui/react";
import axios from 'axios';
import { Upload } from '@geist-ui/react-icons';
import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../../constants";
import { Event, ChallengesResponse, Challenge, EventsResponse, Submission, SubmissionResponse, FileType, SubmissionsResponse } from '../interfaces';
import { CUR_EVENT_ID } from "../Admin";

export const ProjectPage: React.FC = () => {
    const [, setToast] = useToasts();
    const sendNotification = (msg:string, intent: any) => {
        setToast({ text: msg, type: intent, delay: 8000 });
      };


    const [allChalleges, setAllChallenges] = useState<Challenge[]>([])
    const [submissions, setSubmissions] = useState<Submission[]>([])
    useEffect(() => {
      axios.get<ChallengesResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}/challenge`)
      .then(res => {
        setAllChallenges(res.data.result)
      })
      axios.get<SubmissionsResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/user`)
      .then(res => {
          setSubmissions(res.data.result)
      })
      .catch(res => {
        if (res.response.status === 307) {
          window.location.replace(`https://tamudatathon.com${String(res.response.data.error)}`);
        }
        sendNotification(String(res.response.data.error), "error");
      })
    },[])

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
        challengeId: "",
        videoLink: "",
        answer1: "",
        answer2: "",
        answer3: "",
        answer4: "",
        answer5: "",
        sourceCode: "",
        photos: "",
        icon: "",
        markdown: "",
        accoladeIds: []
      })

    const handleUpdateSubmission = () => {
      axios.post(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/add`, submission)
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
      axios.get<SubmissionResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${id}`)
      .then(res => setSubmission(res.data.result));
    }

    const [sourceCode, setSourceCode] = useState<any>();
    const sourceCodeHandler = (e:any) => setSourceCode(e.target.files[0])

    const [photos, setPhotos] = useState<any>();
    const photosHandler = (e:any) => setPhotos(e.target.files[0])

    const [icon, setIcon] = useState<any>();
    const iconHandler = (e:any) => setIcon(e.target.files[0])

    const [markdown, setMarkdown] = useState<any>();
    const markdownHandler = (e:any) => setMarkdown(e.target.files[0])

    const uploadFile = (type:FileType) => {
      const data = new FormData();
      if (type === 'sourceCode') data.append('file', sourceCode);
      else if (type === 'photos') data.append('file', photos)
      else if (type === 'icon') data.append('file', icon)
      else if (type === 'markdown') data.append('file', markdown)
      else {
        sendNotification("Incompatible submission file upload detected. Please contact an organizer.", "error");
      }
      axios.post(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${submission?._id}/upload/${type}`, data)
      .then(res => {
       sendNotification(`Uploaded ${type}!`, "success")
     })
     .catch(res => {
       console.log(res)
       sendNotification(String(res.response.data.error), "error");
     })
    }

    return (
    <>
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
        <Radio.Group useRow value={submission?.challengeId} onChange={(c:any) => setSubmission((prev:any) => ({...prev, challengeId: c}))}>
          {allChalleges.map(challenge => <Radio key={challenge._id} value={challenge._id}>{challenge.name}</Radio>)}
        </Radio.Group>
        <Spacer h={1}/>
        {allChalleges.filter(challenge => challenge._id === submission?.challengeId).map(challenge =>
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
        <Spacer h={1}/>
        <Card>
          <Link href={submission?.sourceCode} icon block color>Source Code (.tar, .zip)</Link>
          <Input htmlType="file" accept=".tar,.zip" name="Source Code" onChange={sourceCodeHandler} iconClickable iconRight={<Upload />} onIconClick={() => uploadFile(FileType.sourceCode)}/>
          </Card>
        <Spacer h={1}/>
        <Card>
          <Link href={submission?.photos} icon block color>Project Photos (.zip)</Link>
          <Input htmlType="file" accept=".zip" name="Photos" onChange={photosHandler} iconClickable iconRight={<Upload />} onIconClick={() => uploadFile(FileType.photos)}/>
        </Card>
        <Spacer h={1}/>
        <Card>
          <Link href={submission?.icon} icon block color>Project Image (.jpg, .png)</Link>
          <Input htmlType="file" accept=".jpg,.png" name="Icon" onChange={iconHandler} iconClickable iconRight={<Upload />} onIconClick={() => uploadFile(FileType.icon)}/>
          </Card>
        <Spacer h={1}/>
        <Card>
          <Link href={submission?.markdown} icon block color>Description (.md)</Link>
          <Input htmlType="file" accept=".md" name="Markdown" onChange={markdownHandler} iconClickable iconRight={<Upload />} onIconClick={() => uploadFile(FileType.markdown)}/>
        </Card>
        </Card.Content>
      </Card>
      <Spacer h={0.5}/>
      {submissions?.filter(submission => (submission && submission._id)).map(submission => (
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