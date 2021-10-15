import { Text, Spinner, Grid, Card, useToasts, Image, useModal, Modal } from "@geist-ui/react";
import axios from "axios";
import React, { useState, useEffect } from 'react';
import { BASE_URL } from "../../constants";
import { CUR_EVENT_ID } from "../Admin";
import {EventResponse, Event, Submission, SubmissionResponse} from '../interfaces';
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
  const showSubmission = (id:string) => {
    axios.get<SubmissionResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${id}`)
      .then(res => {
        setMarkdownLoaded(false)
        setVisible(true)
        setSubmission(res.data.result)
        axios.get(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${id}/download/markdown`)
        .then(res => setUserMarkdown(res.data))
        .then(() => setMarkdownLoaded(true))
      })
      .catch(errorHandler);
  }

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
            <div dangerouslySetInnerHTML={{__html: marked(userMarkdown)}} />
          </Modal.Content>
        : <Spinner />
        }
      </Modal>
    </Grid.Container>
  : <Spinner />
  }
  </>)
};
