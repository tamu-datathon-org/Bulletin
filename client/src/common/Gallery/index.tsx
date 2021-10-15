import { Text, Spinner, Grid, Card, useToasts, Image, useModal, Modal, Display, Link, Spacer, Badge, Note } from "@geist-ui/react";
import CardContent from "@geist-ui/react/dist/card/card-content";
import axios from "axios";
import React, { useState, useEffect } from 'react';
import { BASE_URL } from "../../constants";
import { CUR_EVENT_ID } from "../Admin";
import {EventResponse, Event, Submission, SubmissionResponse, AccoladeResp, Accolade} from '../interfaces';
import { authRedirector } from "../Project";
import placeholder from './placeholder.jpg';
const marked = require("marked");


/**
 * Entire Gallery page
 */
export const GalleryPage: React.FC = () => {
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

  const [eventLoaded, setEventLoaded] = useState(false);
  const [curEvent, setCurEvent] = useState<Event>();
  useEffect(() => {
    let mounted = true
    if (CUR_EVENT_ID) {
      setEventLoaded(false)
      axios.get<EventResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}?full=true`)
      .then(res => {
        if (mounted) {
          setCurEvent(res.data.result)
          setEventLoaded(true)
        }
      })
    }
    return () => {
      mounted = false
    }
  }, [])

  const [markdownLoaded, setMarkdownLoaded] = useState(false);
  const { visible, setVisible, bindings } = useModal() // eslint-disable-line
  const [userMarkdown, setUserMarkdown] = useState<string>("");
  const [submission, setSubmission] = useState<Submission>();
  const [accolades, setSubmissionAccolades] = useState<any>([]);
  const showSubmission = (id:string) => {
    axios.get<SubmissionResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${id}`)
      .then(res => {
        setMarkdownLoaded(false)
        setVisible(true)
        setSubmission(res.data.result)
        axios.get(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${id}/download/markdown`)
        .then(res => setUserMarkdown(res.data))
        .then(() => setMarkdownLoaded(true))
        if ((submission?.accoladeIds?.length ?? 0) > 0) {
          const submissionAccolades: Accolade[] = [];
          // eslint-disable-next-line array-callback-return
          submission?.accoladeIds?.map(accoladeId => {
            axios.get<AccoladeResp>(`${BASE_URL}/api/${CUR_EVENT_ID}/accolade/${accoladeId}`)
            .then(res => {
              if (res?.data?.result) submissionAccolades.push(res?.data?.result);
            })
            .catch((res:any) => { // do nothing there's just no accolades on this one
            });
          });
          setSubmissionAccolades(submissionAccolades);
        }
      })
      .catch(errorHandler);
  }

  const videoLinkHandler = (videoLink:string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoLink.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  return (<>
  {eventLoaded
  ? <Grid.Container gap={2} justify="center" height="100px">
      {curEvent?.submissions.map(submission => 
        <Grid key={submission._id} xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card onClick={() => showSubmission(submission._id)} shadow width="100%">
          <Image
            src={submission?.icon?.[1] ? submission.icon[1] : placeholder}
          />
          <Text b>{submission.name}</Text>
          </Card>
        </Grid>
      )}
      <Modal width="100%" {...bindings}>
        <Modal.Title>{submission?.name}</Modal.Title>
        {markdownLoaded 
        ? <Modal.Content>
            <Text span type="success">Created by</Text>
            <Grid.Container gap={1} justify="center" height="100px">
            {submission?.discordTags?.map(discordTag => 
              <Grid xs={6}><Card shadow width="100%"><CardContent><Text span style={{ textTransform: 'none' }}>{discordTag}</Text></CardContent></Card></Grid>
            )}
            {(accolades?.length ?? 0) > 0 && <Card title="Awards"><CardContent>
            {accolades?.map((accolade: Accolade) =>
              <Note type="warning"><Text>{`${accolade?.emoji || "🏆"} `}</Text><Text type="secondary">{accolade?.name || ""}</Text></Note>
            )}
            </CardContent></Card>}
            </Grid.Container>
            <Spacer h={1}/>
            <Text span type="success">Tags</Text>
            <Grid.Container gap={1} justify="center" height="40px">
            {submission?.tags?.map(tag => 
              <Grid xs={6}><Badge type="secondary"><Text span style={{ textTransform: 'none' }}>{tag}</Text></Badge></Grid>
            )}
            </Grid.Container>
            <Spacer h={1}/>
            <Text span type="success">Links</Text>
            <Grid.Container gap={1} justify="center" height="40px">
            {submission?.links?.map(link => 
              <Grid xs={6}><Link href={submission?.photos?.["2"]?.[1] ?? "#"} icon block color><Text span style={{ textTransform: 'none' }}>{link}</Text></Link></Grid>
            )}
            </Grid.Container>
            <Grid.Container gap={1} justify="center" height="100px">
              <>
              <Grid>{submission?.photos?.["0"]?.[1] && <Card shadow width="100%"><CardContent><Image width="500px" height="500px" src={submission?.photos?.["0"]?.[1] || placeholder} /></CardContent></Card>}</Grid>
              <Grid>{submission?.photos?.["1"]?.[1] && <Card shadow width="100%"><CardContent><Image width="500px" height="500px" src={submission?.photos?.["1"]?.[1] || placeholder} /></CardContent></Card>}</Grid>
              <Grid>{submission?.photos?.["2"]?.[1] && <Card shadow width="100%"><CardContent><Image width="500px" height="500px" src={submission?.photos?.["2"]?.[1] || placeholder} /></CardContent></Card>}</Grid>
              </>
            </Grid.Container>
            <Spacer h={1}/>
            <Text span type="success">Video</Text>
            {submission?.videoLink && <Display shadow><iframe title="VideoLinkPreview" src={videoLinkHandler(submission?.videoLink)}></iframe></Display>}
            <Spacer h={1}/>
            <Text span type="success">Description</Text>
            <div dangerouslySetInnerHTML={{__html: marked(userMarkdown)}} />
            <Spacer h={1}/>
            {submission?.sourceCode?.[1] && <Display><Card title="Download the sourceCode"><CardContent><Link href={submission?.sourceCode?.[1]} icon>{submission?.sourceCode?.[1]}</Link></CardContent></Card></Display>}
          </Modal.Content>
        : <Spinner />
        }
      </Modal>
    </Grid.Container>
  : <Spinner />
  }
  </>)
};
