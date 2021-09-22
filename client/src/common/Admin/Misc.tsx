import React, {useEffect, useState} from 'react';
import * as UI from './style';
import axios from "axios";
import useSWR from "swr";
import {Button, Input, Select, Text, useToasts, Spacer, Spinner, Fieldset, Card, Divider} from "@geist-ui/react";

interface Accolade {
  _id: string,
  challengeId: string,
  description: string,
  emoji: string,
  eventId: string,
  name: string
}

interface AccoladeResp {
  result: Accolade
}

interface Events {
  name: string;
  _id: string;
  description: string;
  start_time: string;
  end_time: string;
  challengeIds: string[];
  accoladeIds: string[];
  submissionIds: string[];
  image: string;
  imageKey: string;
  accolades: Accolade[];
}

interface Resp {
  result: Events;
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

  const sendNotification = (msg:string, intent: any) => {
    setToast({ text: msg, type: intent, delay: 8000 });
  };

  const [curEventId, setCurEventId] = useState<string>("");
  const [eventLoaded, setEventLoaded] = useState(false);
  const [, setToast] = useToasts();

  const [curEvent, setCurEvent] = useState<Events>();
  useEffect(() => {
    if (curEventId && curEventId !== "create_new_event") {
      setEventLoaded(false);
      axios.get<Resp>(`http://localhost:3000/bulletin/api/${curEventId}?full=true`)
      .then(res => {
        setCurEvent(res.data.result);
        setEventLoaded(true);
      });
    }
  },[curEventId]);

  const setEventHandler = (val:any) => {
    if (val === "create_new_event") {
      const date_string = new Date().toISOString();
      axios.post('http://localhost:3000/bulletin/api/admin/add/event', {
        name: `New Event created at ${date_string}`,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit....",
        start_time: date_string,
        end_time: date_string
      })
      .then(res => {
        sendNotification("Added new event!", "success");
      })
      .catch(res => {
        sendNotification(String(res.response.data.error), "error");
      })
    }
    setCurEventId((val as string));
  };
  
  const [editable, setEditable] = useState(false);
  const handleEditButton = () => {

    setEditable(prev => {
      if (prev) {
        axios.post(`http://localhost:3000/bulletin/api/admin/add/event/?eventId=${curEventId}`, curEvent)
        .then(() => sendNotification("Updated event!", "success"))
        .catch(res => {
          sendNotification(String(res.response.data.error), "error");
        })
      }
      return !prev
    });
  }

  const deleteEvent = () => {
    if (window.confirm(`Are you sure you want to delete ${curEvent?.name}`)) {
      if (window.prompt("To delete this event, enter the full event name","") === curEvent?.name) {
        axios.post(`http://localhost:3000/bulletin/api/${curEventId}/admin/remove/event`)
        .then(() => sendNotification("Deleted event!", "success"))
        .catch(res => {
          sendNotification(String(res.response.data.error), "error");
        })
      } else {
        window.alert("Incorrect event name.")
      }
    }
  }

  const eventDataHandler = (e:any) => setCurEvent((prev:any) => ({...prev, [e.target.id]: e.target.value}));

  const [curAccolade, setCurAccolade] = useState<Accolade>();
  const handleEditAccolade = (id:string) => {
    axios.get<AccoladeResp>(`http://localhost:3000/bulletin/api/${curEventId}/accolade/${id}`)
    .then(res => setCurAccolade(res.data.result));
  }
  const emptyCurAccolade = () => setCurAccolade({
    _id: "",
    challengeId: "",
    description: "",
    emoji: "",
    eventId: "",
    name: ""})
  const accoladeDataHandler = (e:any) => setCurAccolade((prev:any) => ({...prev, [e.target.id]: e.target.value}));

  const handleUpdateAccolade = () => {
    axios.post(`http://localhost:3000/bulletin/api/${curEventId}/admin/add/accolade`, curAccolade)
    .then(() => {
      sendNotification("Updated accolade!", "success")
      emptyCurAccolade();
    })
    .catch(res => {
      sendNotification(String(res.response.data.error), "error");
    })
  }
  const deleteAccolade = () => {
    axios.post(`http://localhost:3000/bulletin/api/${curEventId}/admin/remove/accolade/${curAccolade?._id}`)
    .then(() => {
      sendNotification("Deleted accolade!", "success")
      emptyCurAccolade();
    })
    .catch(res => {
      sendNotification(String(res.response.data.error), "error");
    })
  }

  if (eventList.length === 0) {
    return (<Spinner />)
  } else {
    return (
      <>
      <Spacer h={0.5}/>
      <Select placeholder="Add/Select an Event" onChange={setEventHandler}>
        <Select.Option value="create_new_event">Add new event</Select.Option>
        <Select.Option divider />
        {eventList.map(event => {
          return <Select.Option key={event._id} value={event._id}>{event.name}</Select.Option>
        })}
      </Select>
      {eventLoaded &&
      <>
      <Spacer h={1}/>
      <Input width="100%" label="Name" disabled={!editable} value={curEvent?.name} id="name" onChange={eventDataHandler}/>
      <Spacer h={1}/>
      <Input width="100%" label="Description" disabled={!editable} value={curEvent?.description} id="description" onChange={eventDataHandler}/>
      <Spacer h={1}/>
      <Button onClick={handleEditButton}>{editable ? "Update" : "Edit"}</Button>
      <Spacer h={0.5}/>
      <Button onClick={deleteEvent}>Delete</Button>
      <Spacer h={1}/>
      <Fieldset.Group value="accolades">
        <Fieldset label="accolades">
          <Card>
            <Card.Content>
              <Text b>Add/Update an Accolade</Text>
            </Card.Content>
            <Divider />
            <Card.Content>
              <Input label="Name" value={curAccolade?.name} id="name" onChange={accoladeDataHandler}/>
              <Input label="Description" value={curAccolade?.description} id="description" onChange={accoladeDataHandler}/>
              <Spacer h={0.5}/>
              <Button onClick={handleUpdateAccolade}>{curAccolade?._id ? "Update" : "Add"}</Button>
              <Spacer h={0.5}/>
              <Button onClick={deleteAccolade}>Delete</Button>
            </Card.Content>
          </Card>
          <Spacer h={0.5}/>
          {curEvent?.accolades.map(accolade => (
            <Card key={accolade._id}>
              <Text>{accolade.name}</Text>
              <Text>{accolade.description}</Text>
              <Button auto scale={0.5} value={accolade._id} onClick={() => handleEditAccolade(accolade._id)}>Edit</Button>
            </Card>
            )
          )}
        </Fieldset>
        <Fieldset label="challenges">
          
        </Fieldset>
        <Fieldset label="submissions">
          
        </Fieldset>
      </Fieldset.Group>
      </>
      }
    </>)
  }
};
