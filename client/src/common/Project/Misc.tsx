import React, {useEffect, useState} from 'react';
import {Spacer, Button, useToasts, Input} from "@geist-ui/react";
import * as UI from './style';
import { BASE_URL } from "../../constants";
import axios from 'axios';

export interface Submission {
  _id: string,
  name: string,
  tags: Array<string>,
  links: Array<string>,
  discordTags: Array<string>,
  challenges: Array<string>,
}

interface Response {
    result: Submission;
}

export const ProjectPage: React.FC = () => {
    const [, setToast] = useToasts();
    const sendNotification = (msg:string, intent: any) => {
        setToast({ text: msg, type: intent, delay: 8000 });
      };

    // TODO: Get this from URL
    const curEventId = "614937d1ed5af243851bb789"
    const curChallengeId = ["615274800bcfdcac019b1a5a"]

    // TODO: submissionId = getSubmissionId(curEventId, userAuthId)
    const [submissionId, setSubmissionId] = useState<string>("615a0751cfcb12b04de40c7f");
    
    const [submission, setSubmission] = useState<Submission>();
    useEffect(() => {
        axios.get<Response>(`${BASE_URL}/api/${curEventId}/submission/${submissionId}`)
        .then(res => {
          console.log(res.data.result)
          setSubmission(res.data.result)
        });
    }, [])
    const submissionDataHandler = (e:any) => setSubmission((prev:any) => ({...prev, [e.target.id]: (e.target.id === "name" ? e.target.value : e.target.value.split(','))}));

    const [editable, setEditable] = useState(false);
    const handleEditButton = () => {
      setSubmission((prev:any) => ({...prev, "challenges": curChallengeId}))
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

    return (
    <>
      <Spacer h={1}/>
      <Input width="100%" label="Name" disabled={!editable} value={submission?.name} id="name" onChange={submissionDataHandler}/>
      <Spacer h={1}/>
      <Input width="100%" label="Discord Tags" disabled={!editable} value={submission?.discordTags?.join()} id="discordTags" onChange={submissionDataHandler}/>
      <Spacer h={1}/>
      <Button onClick={handleEditButton}>{editable ? "Update" : "Edit"}</Button>
    </>
    );
};