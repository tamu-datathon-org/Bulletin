import React, {useEffect, useState} from 'react';
import * as UI from './style';
import axios from "axios";
import useSWR from "swr";
import {Text, Input, Select} from "@geist-ui/react";

interface Events {
  name: string;
}

interface Response {
  result: Events[];
}

/**
 * Entire admin page
 */
 export const AdminPage: React.FC = () => {
  const [eventList, setEventList] = useState<Events[]>([]);
  useEffect(() => {
    axios.get<Response>(`http://localhost:3000/bulletin/api/events`)
    .then(res => setEventList(res.data.result));
  },[]);

  const [curEvent, setCurEvent] = useState<string>("");
  const setEventHandler = (val:any) => setCurEvent((val as string));
  
  if (eventList.length === 0) {
    return (<>Loading admin page to create/edit events, add/award prizes, modify submissions, and more...</>)
  } else {
    return (
      <>
      {/* form */}
        <Input placeholder="Geist UI" />
        {/* submit posts info to /bulletin/api/admin/add/event */}
      {/* form */}
      <Select placeholder="Choose one" onChange={setEventHandler}>
      {eventList.map(event => {
        return <Select.Option>{event.name}</Select.Option>
      })}
    </Select>
    </>)
  }
};
