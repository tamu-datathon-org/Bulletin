import { Text, Spinner, Grid, Display, Card, useToasts, Image, Link, Spacer, Note } from "@geist-ui/react";
import axios from "axios";
import React, { useState, useEffect } from 'react';
import { BASE_URL } from "../../constants";
import { CUR_EVENT_ID } from "../Admin";
import {Submission, SubmissionResponse, AccoladeResp, Accolade, MarkdownResponse} from '../interfaces';
import { authRedirector } from "../Project";
import {
    useParams
  } from "react-router-dom";

import placeholder from '../Gallery/placeholder.jpg';
const marked = require("marked");

/**
 * ProjectView page
 */
export const ProjectView: React.FC = () => {
  let { id } = useParams<{id: string}>();
  const [, setToast] = useToasts();
  const sendNotification = (msg:string, intent: any) => {
    setToast({ text: msg, type: intent, delay: 8000 });
  };
  const errorHandler = (res:any) => {
    authRedirector(res);
    if (res?.response?.data?.error) {
      sendNotification(String(res.response.data.error), 'error');
    } else {
      sendNotification("Server Error!", 'error');
    }
  }

  const [userMarkdown, setUserMarkdown] = useState<string>("");
  const [submission, setSubmission] = useState<Submission>();
  const [accolades, setSubmissionAccolades] = useState<any>([]);
  useEffect(() => {
    axios.get<SubmissionResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${id}`)
    .then(res => {
      setSubmission(res.data.result)
      axios.get<MarkdownResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${id}/markdown`)
      .then(res => setUserMarkdown(res.data.result?.text))
      .catch()
      if ((res.data.result?.accoladeIds?.length ?? 0) > 0) {
        const submissionAccolades: Accolade[] = [];
        // eslint-disable-next-line array-callback-return
        res.data.result?.accoladeIds?.map(accoladeId => {
          axios.get<AccoladeResp>(`${BASE_URL}/api/${CUR_EVENT_ID}/accolade/${accoladeId}`)
          .then(res => {
            if (res?.data?.result) submissionAccolades.push(res?.data?.result);
          })
          .catch((res:any) => { // do nothing there's just no accolades on this one
          });
        });
        setSubmissionAccolades(submissionAccolades);
      }
      videoLinkHandler(res.data.result?.videoLink);
    })
    .catch(errorHandler);
  },[id]) // eslint-disable-line

  // eslint-disable-next-line
  const [embeddedVideoLink, setEmbeddedVideoLink] = useState<any>();
  const videoLinkHandler = (videoLink:string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoLink.match(regExp);
    setEmbeddedVideoLink(`https://www.youtube.com/embed/${(match && match[2].length === 11) ? match[2] : ""}`);
  };

  return (submission?._id 
         ? <>
            <Text h2>{submission?.name}</Text>
            {submission?.discordTags?.length !== 0 && <>
              <Text span type="secondary">Created by: {submission?.discordTags?.join(', ')}</Text>
            </>}
            {/* {submission?.submission_time && <Text small>{`Last Update: ${(new Date(submission?.submission_time).toLocaleString('en-US'), "dddd, mmmm dS, yyyy, h:MM:ss TT")}`}</Text>} */}
            {(accolades?.length ?? 0) > 0 && 
            <Card title="Awards">
              <Card.Content>
                {accolades?.map((accolade: Accolade) =>
                  <Note type="warning"><Text>{`${accolade?.emoji || "🏆"} `}</Text><Text type="secondary">{accolade?.name || ""}</Text></Note>
                )}
              </Card.Content>
            </Card>}
            {submission?.tags?.length !== 0 && <>
              <Spacer h={1}/>
              <Text>Tags:</Text>
              <Text span type="secondary">{submission?.tags?.join(', ')}</Text>
              {/* <Grid.Container gap={1} justify="center" height="40px">
              {submission?.tags?.map(tag => 
                <Badge type="secondary">{tag}</Badge>
              )}
              </Grid.Container> */}
            </>}
            {submission?.links?.length !== 0 && <>
              <Spacer h={1}/>
              <Text>Links:</Text>
              {/* <Grid.Container gap={1} justify="center" height="40px"> */}
              {submission?.links?.map(link => 
                <Grid xs={6}><Link target="_blank" href={link ?? "#"} icon block color><Text span style={{ textTransform: 'none' }}>{link}</Text></Link></Grid>
              )}
              {/* </Grid.Container> */}
            </>}
            {(submission?.photos?.["0"]?.[1] || submission?.photos?.["1"]?.[1] || submission?.photos?.["2"]?.[1]) &&
              <Grid.Container gap={1} justify="center" height="100px">
                <Grid>{submission?.photos?.["0"]?.[1] && <Card shadow width="100%"><Card.Content><Image width="500px" height="500px" src={submission?.photos?.["0"]?.[1] || placeholder} /></Card.Content></Card>}</Grid>
                <Grid>{submission?.photos?.["1"]?.[1] && <Card shadow width="100%"><Card.Content><Image width="500px" height="500px" src={submission?.photos?.["1"]?.[1] || placeholder} /></Card.Content></Card>}</Grid>
                <Grid>{submission?.photos?.["2"]?.[1] && <Card shadow width="100%"><Card.Content><Image width="500px" height="500px" src={submission?.photos?.["2"]?.[1] || placeholder} /></Card.Content></Card>}</Grid>
              </Grid.Container>
            }
            {submission?.videoLink && <>
              <Spacer h={1}/>
              <Text>Video:</Text>
              {embeddedVideoLink && <Display shadow><iframe title="VideoLinkPreview" src={embeddedVideoLink}></iframe></Display>}
            </>}
            {userMarkdown && <>
              <Spacer h={1}/>
              <Text>Project Description:</Text>
              <div dangerouslySetInnerHTML={{__html: marked(userMarkdown)}} />
            </>}
            {submission?.sourceCode?.[1] && <>
                <Spacer h={1}/>
                <Text>Download the Project Source Code:</Text>
                <Link target="_blank" icon block color type="sucess" href={submission?.sourceCode?.[1]}>{submission?.sourceCode?.[1]}</Link>
            </>}
          </>
        : <Spinner />
        )
};
