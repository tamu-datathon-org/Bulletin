import { Text, Spinner, Grid, Card, Image, Badge, useTheme } from "@geist-ui/react";
import axios from "axios";
import React, { useState, useEffect } from 'react';
import { BASE_URL } from "../../constants";
import { CUR_EVENT_ID } from "../Admin";
import {EventResponse, Event} from '../interfaces';
import {
  Link as RouterLink
} from "react-router-dom";
import placeholder from './placeholder.jpg';

/**
 * Entire Gallery page
 */
export const GalleryPage: React.FC = () => {
  const { palette } = useTheme();

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
          <RouterLink to={`project/${submission._id}`}>
            <Card shadow width="100%">
            <Image
              src={submission?.icon?.[1] ? submission.icon[1] : placeholder}
            />
            <Text b>{submission.name}</Text>
            </Card>
          </RouterLink>
          {((submission?.accoladeIds?.length ?? 0) > 0) && <Badge style={{ backgroundColor: palette.background, border: 1, borderColor: palette.accents_8, color: palette.foreground }}>{"Winner 🏆"}</Badge>}
        </Grid>
      )}
    </Grid.Container>
  : <Spinner />
  }
  </>)
};
