import { Text, Spinner, Grid, Card, Image } from "@geist-ui/react";
import axios from "axios";
import React, { useState, useEffect } from 'react';
import { BASE_URL } from "../../constants";
import { CUR_EVENT_ID } from "../Admin";
import {EventResponse, Event} from '../interfaces';
import placeholder from './placeholder.jpg';


/**
 * Entire Gallery page
 */
export const GalleryPage: React.FC = () => {
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
  return (<>
  {eventLoaded
  ? <Grid.Container gap={2} justify="center" height="100px">
      {curEvent?.submissions.map(submission => 
        <Grid key={submission._id} xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card shadow width="100%">
          <Image
            src={submission.icon ? submission.icon?.[1] : placeholder}
          />
          <Text b>{submission.name}</Text>
          </Card>
        </Grid>
      )}
    </Grid.Container>
  : <Spinner />
  }
  </>)
};
