import { Button, Card, Divider, Fieldset, Image, Input, Select, Spacer, Spinner, Text, useToasts } from "@geist-ui/react";
import { Upload } from '@geist-ui/react-icons';
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../../constants";
import { Submission } from '../Project/Misc';

interface Accolade {
  _id: string,
  challengeId: string,
  description: string,
  emoji: string,
  eventId: string,
  name: string
}

interface Challenge {
  _id: string,
  name: string,
  questions: Array<string>
  places: number
}

interface ChallengeResp {
  result: Challenge
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
  challenges: Challenge[];
  submissions: Submission[];
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
    axios.get<Response>(`${BASE_URL}/api/events`)
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
      axios.get<Resp>(`${BASE_URL}/api/${curEventId}?full=true`)
      .then(res => {
        setCurEvent(res.data.result);
        setEventLoaded(true);
      });
    }
  },[curEventId]);

  const setEventHandler = (val:any) => {
    if (val === "create_new_event") {
      const date_string = new Date().toISOString();
      axios.post(`${BASE_URL}/api/admin/add/event`, {
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
        axios.post(`${BASE_URL}/api/admin/add/event`, curEvent)
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
        axios.post(`${BASE_URL}/api/${curEventId}/admin/remove/event`)
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
    axios.get<AccoladeResp>(`${BASE_URL}/api/${curEventId}/accolade/${id}`)
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
    axios.post(`${BASE_URL}/api/${curEventId}/admin/add/accolade`, curAccolade)
    .then(() => {
      sendNotification("Updated accolade!", "success")
      emptyCurAccolade();
    })
    .catch(res => {
      sendNotification(String(res.response.data.error), "error");
    })
  }
  const deleteAccolade = () => {
    axios.post(`${BASE_URL}/api/${curEventId}/admin/remove/accolade/${curAccolade?._id}`)
    .then(() => {
      sendNotification("Deleted accolade!", "success")
      emptyCurAccolade();
    })
    .catch(res => {
      sendNotification(String(res.response.data.error), "error");
    })
  }

   const [curChallenge, setCurChallenge]=useState<Challenge>();
   const challengeDataHandler = (e:any) => setCurChallenge((prev:any) => ({...prev,  [e.target.id]: e.target.value}));
   const handleQuestionChange = (i:number, e:any) => {
     const values:Array<string> = curChallenge ? curChallenge.questions : [];
     values[i]=(e.target.value as string)
     setCurChallenge((prev:any) => ({...prev, "questions":values})) 
   }
   const handleQuestionDelete = (i:number) => {
     const values = [...curChallenge!.questions]
     values.splice(i,1)
     setCurChallenge((prev:any) => ({...prev, "questions":values}))
   }
   const handleQuestionAdd = () => {
     const values:Array<string> = curChallenge?.questions ? curChallenge.questions : [];
     values.push("");
     setCurChallenge((prev:any)=>({...prev,"questions":values}))
   }
   const emptyCurChallenge = () => setCurChallenge({
    _id: "",
    name: "",
    questions: [],
    places: 0,
   })
   const handleUpdateChallenge = () => {
     axios.post(`${BASE_URL}/api/${curEventId}/admin/add/challenge`, curChallenge)
     .then(() => {
       sendNotification("Updated challenge!", "success")
       emptyCurChallenge();
     })
     .catch(res => {
       sendNotification(String(res.response.data.error), "error");
     })
   }
   const deleteChallenge = () => {
    axios.post(`${BASE_URL}/api/${curEventId}/admin/remove/challenge/${curChallenge?._id}`)
    .then(() => {
      sendNotification("Deleted challenge!", "success")
      emptyCurChallenge();
    })
    .catch(res => {
      sendNotification(String(res.response.data.error), "error");
    })
   }
   const handleEditChallenge = (id:string) => {
    axios.get<ChallengeResp>(`${BASE_URL}/api/${curEventId}/challenge/${id}`)
    .then(res => setCurChallenge(res.data.result));
   }

   const [file, setFile] = useState<any>();
   const fileHandler = (e:any) => {
     setFile(e.target.files[0])
   }
   const uploadFile = () => {
     const data = new FormData();
     data.append('file', file);
     axios.post(`${BASE_URL}/api/${curEventId}/admin/upload/eventImage`, data)
     .then(res => {
       console.log(res)
      sendNotification("Uploaded image!", "success")
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
      <Input width="100%" label="id" disabled value={curEvent?._id} id="_id"/>
      <Spacer h={1}/>
      <Input width="100%" label="Name" disabled={!editable} value={curEvent?.name} id="name" onChange={eventDataHandler}/>
      <Spacer h={1}/>
      <Input width="100%" label="Description" disabled={!editable} value={curEvent?.description} id="description" onChange={eventDataHandler}/>
      <Spacer h={1}/>
      <Button onClick={handleEditButton}>{editable ? "Update" : "Edit"}</Button>
      <Spacer h={0.5}/>
      <Button onClick={deleteEvent}>Delete</Button>
      <Spacer h={1}/>
      <Image height="160px" src={curEvent ? curEvent.image : ""} />
      <Spacer h={1}/>
      <Input htmlType="file" name="file" onChange={fileHandler} iconClickable iconRight={<Upload />} onIconClick={uploadFile}/>
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
        <Card>
            <Card.Content>
              <Text b>Add/Update a Challenge</Text>
            </Card.Content>
            <Divider />
            <Card.Content>
              <Input label="Name" value={curChallenge?.name} id="name" onChange={challengeDataHandler}/>
              {
                curChallenge?.questions?.map((question,i) =>
                <>
                <Input value={question} onChange={e => handleQuestionChange(i,e)}></Input>
                <Button value={i} onClick={()=>handleQuestionDelete(i)}>Remove</Button>
                </>)
              }
              <Button onClick={handleQuestionAdd}>Add Question</Button>
              <Spacer h={0.5}/>
              <Button onClick={handleUpdateChallenge}>{curChallenge?._id ? "Update" : "Add"}</Button>
              <Spacer h={0.5}/>
              <Button onClick={deleteChallenge}>Delete</Button>
            </Card.Content>
          </Card>
          <Spacer h={0.5}/>
          {curEvent && curEvent.challenges.map(challenge => (
            <Card key={challenge._id}>
              <Text>{challenge.name}</Text>
              {challenge.questions.map(question=><Text>{question}</Text>)}
              <Button auto scale={0.5} value={challenge._id} onClick={() => handleEditChallenge(challenge._id)}>Edit</Button>
            </Card>
            )
          )}
        </Fieldset>
        <Fieldset label="submissions">
        {curEvent && curEvent.submissions.map(submission => 
        (<Card key={submission._id}>
            <Text>{submission.name}</Text>
          </Card>)
        )}
        </Fieldset>
      </Fieldset.Group>
      </>
      }
    </>)
  }
};
