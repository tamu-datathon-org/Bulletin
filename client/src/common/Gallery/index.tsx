import { Text, Spinner, Grid, Card, useToasts, Image, useModal, Modal, Display, Link, Spacer, Badge, Note, useTheme } from "@geist-ui/react";
import axios from "axios";
import React, { useState, useEffect } from 'react';
import { BASE_URL } from "../../constants";
import { CUR_EVENT_ID } from "../Admin";
import {EventResponse, Event, Submission, SubmissionResponse, AccoladeResp, Accolade, MarkdownResponse} from '../interfaces';
import { authRedirector } from "../Project";
import placeholder from './placeholder.jpg';
const marked = require("marked");

/**
 * Entire Gallery page
 */
export const GalleryPage: React.FC = () => {
  const { palette } = useTheme();
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
        axios.get<MarkdownResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${id}/markdown`)
        .then(res => setUserMarkdown(res.data.result.text))
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
          <Badge style={{ backgroundColor: palette.background, border: 1, borderColor: palette.accents_8 }}>{"Winner 🏆"}</Badge>
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
            {submission?.discordTags?.length !== 0 && <>
              <Text span type="secondary">Created by</Text>
              <Grid.Container gap={1} justify="center" height="100px">
                {submission?.discordTags?.map(discordTag => 
                  <Grid xs={6}><Card shadow width="100%"><Card.Content><Text span style={{ textTransform: 'none' }}>{discordTag}</Text></Card.Content></Card></Grid>
                )}
              </Grid.Container>
            </>}
            {submission?.submission_time && <Text small>{`Last Update: ${(new Date(submission?.submission_time).toLocaleString('en-US'), "dddd, mmmm dS, yyyy, h:MM:ss TT")}`}</Text>}
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
              <Text span type="secondary">Tags</Text>
              <Grid.Container gap={1} justify="center" height="40px">
              {submission?.tags?.map(tag => 
                <Grid xs={6}><Badge type="secondary"><Text span style={{ textTransform: 'none' }}>{tag}</Text></Badge></Grid>
              )}
              </Grid.Container>
            </>}
            {submission?.links?.length !== 0 && <>
              <Spacer h={1}/>
              <Text span type="secondary">Links</Text>
              <Grid.Container gap={1} justify="center" height="40px">
              {submission?.links?.map(link => 
                <Grid xs={6}><Link href={submission?.photos?.["2"]?.[1] ?? "#"} icon block color><Text span style={{ textTransform: 'none' }}>{link}</Text></Link></Grid>
              )}
              </Grid.Container>
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
              <Text span type="secondary">Video</Text>
              <Display shadow><iframe title="VideoLinkPreview" src={videoLinkHandler(submission?.videoLink)}></iframe></Display>
            </>}
            {userMarkdown && <>
              <Spacer h={1}/>
              <Text span type="secondary">Description</Text>
              <div dangerouslySetInnerHTML={{__html: marked(userMarkdown)}} />
            </>}
            {submission?.sourceCode?.[1] && <>
                <Spacer h={1}/>
                <Display>
                  <Card title="Download the sourceCode">
                    <Card.Content>
                      <Link type="sucess" href={submission?.sourceCode?.[1]} icon>{submission?.sourceCode?.[1]}</Link>
                    </Card.Content>
                  </Card>
                </Display>
            </>}
          </Modal.Content>
        : <Spinner />
        }
      </Modal>
    </Grid.Container>
  : <Spinner />
  }
  </>)
};
