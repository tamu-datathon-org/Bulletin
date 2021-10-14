import { Button, Card, Radio, Divider, Toggle, Fieldset, Image, Input, Select, Spacer, Spinner, Text, useToasts } from "@geist-ui/react";
import { Upload } from '@geist-ui/react-icons';
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../../constants";
import { Submission, SubmissionResponse, EventsResponse, EventResponse, Event, Accolade, AccoladeResp, Challenge, ChallengeResp } from '../interfaces';
import 'react-datepicker/dist/react-datepicker.css'
import DatePicker from "react-datepicker";

export const CUR_EVENT_ID = "61638c45dacc9ccfee024234"

/**
 * Entire admin page
 */
 export const AdminPage: React.FC = () => {
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [eventList, setEventList] = useState<Event[]>([]);
  useEffect(() => {
    let mounted = true
    axios.get<EventsResponse>(`${BASE_URL}/api/events`)
    .then(res => {
      if (mounted){
        setEventList(res.data.result)
       setEventsLoaded(true)
      }
    });
    return () => {
      mounted = false;
    }
  },[]);

  const sendNotification = (msg:string, intent: any) => {
    setToast({ text: msg, type: intent, delay: 8000 });
  };

  const [curEventId, setCurEventId] = useState<string>("");
  const [eventLoaded, setEventLoaded] = useState(false);
  const [, setToast] = useToasts();

  const [curEvent, setCurEvent] = useState<Event>();
  useEffect(() => {
    let mounted = true
    if (curEventId) {
      setEventLoaded(false);
      axios.get<EventResponse>(`${BASE_URL}/api/${curEventId}?full=true`)
      .then(res => {
        if (mounted) {
          setCurEvent(res.data.result);
          setEventLoaded(true);
        }
      });
      return () => {
        mounted = false;
      }
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
    } else {
      setCurEventId((val as string));
    }
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
  const eventDateDataHandler = (e:any, place:string) => setCurEvent((prev:any) => ({...prev, [place]: e}));

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
   const emptyCurChallenge = () => setCurChallenge({
    _id: "",
    name: "",
    places: 0,
    accoladeIds: [],
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
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
      sendNotification("Uploaded image!", "success")
    })
    .catch(res => {
      sendNotification(String(res.response.data.error), "error");
    })
   }

   const [curSubmission, setCurSubmission]=useState<Submission>();
   const emptyCurSubmission = () => setCurSubmission({
      _id: "",name: "",tags: [],links: [],discordTags: [],challengeId: "",
      videoLink: "",answer1: "",answer2: "",answer3: "",answer4: "",answer5: "",
      sourceCode: "",photos: "",icon: "",markdown: "",accoladeIds: []
    })
   const handleEditSubmission = (id:string) => {
    axios.get<SubmissionResponse>(`${BASE_URL}/api/${curEventId}/submission/${id}`)
    .then(res => setCurSubmission(res.data.result));
   }
   const deleteSubmission = () => {
    if (window.confirm(`Are you sure you want to delete this submission? Name: ${curSubmission?.name}, Discord Tags: ${curSubmission?.discordTags}`)) {
      if (window.prompt("To delete this submission, enter the full submission name","") === curSubmission?.name) {
        axios.post(`${BASE_URL}/api/${curEventId}/admin/submission/${curSubmission?._id}/remove`)
        .then(() => {
          sendNotification("Deleted submission!", "success")
          emptyCurSubmission();
        })
        .catch(res => {
          sendNotification(String(res.response.data.error), "error");
        })
      } else {
        window.alert("Incorrect submission name.")
      }
    }
   }
   const updateSubmissionAccolades = () => {
    axios.post(`${BASE_URL}/api/${curEventId}/admin/submission/${curSubmission?._id}/accolades`, curSubmission)
    .then(() => {
      sendNotification("Updated submission accolades!", "success")
      emptyCurSubmission();
    })
    .catch(res => {
      sendNotification(String(res.response.data.error), "error");
    })
   }

  if (!eventsLoaded) {
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
      <Text>Visible to public:</Text>
      <Toggle checked={curEvent?.show} disabled={!editable} onChange={(e:any) => {
        e.target.value = e.target.checked
        e.target.id = "show"
        eventDataHandler(e);
        }}/>
      <Spacer h={1}/>
      <Text>Start time:</Text>
      <DatePicker
        selected={new Date(Date.parse(curEvent!.start_time))}
        onChange={(date) => eventDateDataHandler(date?.toString(), "start_time")}
        timeInputLabel="Time:"
        dateFormat="MM/dd/yyyy h:mm aa"
        showTimeInput
        readOnly={!editable}
      />
      <Spacer h={1}/>
      <Text>End time:</Text>
      <DatePicker
        selected={new Date(Date.parse(curEvent!.end_time))}
        onChange={(date) => eventDateDataHandler(date?.toString(), "end_time")}
        timeInputLabel="Time:"
        dateFormat="MM/dd/yyyy h:mm aa"
        showTimeInput
        readOnly={!editable}
      />
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
              <Spacer h={0.5}/>
              <Input label="Description" value={curAccolade?.description} id="description" onChange={accoladeDataHandler}/>
              <Spacer h={0.5}/>
              <Input label="Emoji" value={curAccolade?.emoji} id="emoji" onChange={accoladeDataHandler}/>
              <Spacer h={0.5}/>
              <Select value={curAccolade?.challengeId} placeholder="Select a Challenge" onChange={(s:any) => setCurAccolade((prev:any) => ({...prev, challengeId: s}))}>
                {curEvent?.challenges.map(challenge => {
                  return <Select.Option key={challenge._id} value={challenge._id}>{challenge.name}</Select.Option>
                })}
              </Select>
              <Spacer h={0.5}/>
              <Button onClick={handleUpdateAccolade}>{curAccolade?._id ? "Update" : "Add"}</Button>
              <Spacer h={0.5}/>
              <Button onClick={deleteAccolade}>Delete</Button>
            </Card.Content>
          </Card>
          <Spacer h={0.5}/>
          {curEvent?.accolades.map(accolade => (
            <React.Fragment key={accolade._id}>
              <Card>
                <Text>{accolade.name}</Text>
                <Text>{accolade.description}</Text>
                <Button auto scale={0.5} value={accolade._id} onClick={() => handleEditAccolade(accolade._id)}>Edit</Button>
              </Card>
              <Spacer h={0.5}/>
            </React.Fragment>
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
              <Spacer h={0.5}/>
              <Text>Places:</Text>
              <Radio.Group value={curChallenge?.places} id="places" onChange={(p:any) => setCurChallenge((prev:any) => ({...prev, places: p}))} useRow>
                {[1,2,3].map(i => <Radio key={i} value={i}>{i}</Radio>)}
              </Radio.Group>
              <Spacer h={0.5}/>
                <Input label="Question 1" value={curChallenge?.question1} id="question1" key="question1" onChange={challengeDataHandler}/>
                <Input label="Question 2" value={curChallenge?.question2} id="question2" key="question2" onChange={challengeDataHandler}/>
                <Input label="Question 3" value={curChallenge?.question3} id="question3" key="question3" onChange={challengeDataHandler}/>
                <Input label="Question 4" value={curChallenge?.question4} id="question4" key="question4" onChange={challengeDataHandler}/>
                <Input label="Question 5" value={curChallenge?.question5} id="question5" key="question5" onChange={challengeDataHandler}/>
              <Spacer h={0.5}/>
              <Button onClick={handleUpdateChallenge}>{curChallenge?._id ? "Update" : "Add"}</Button>
              <Spacer h={0.5}/>
              <Button onClick={deleteChallenge}>Delete</Button>
            </Card.Content>
          </Card>
          <Spacer h={0.5}/>
          {curEvent && curEvent.challenges.map(challenge => (
            <React.Fragment key={challenge._id}>
              <Card key={challenge._id}>
                <Text>{challenge.name}</Text>
                <Button auto scale={0.5} value={challenge._id} onClick={() => handleEditChallenge(challenge._id)}>Edit</Button>
              </Card>
              <Spacer h={0.5}/>
            </React.Fragment>
            )
          )}
        </Fieldset>
        <Fieldset label="submissions">
        <Card>
          <Card.Content>
            <Text b>Award/Delete a Submission</Text>
          </Card.Content>
          <Divider />
          <Card.Content>
            <Input width="100%" key="name" label="Name" value={curSubmission?.name} id="name" disabled/>
            <Spacer h={0.5}/>
            <Input width="100%" key="tags" label="Tags" value={curSubmission?.tags?.join()} id="tags" disabled/>
            <Spacer h={0.5}/>
            <Input width="100%" key="links" label="Links" value={curSubmission?.links?.join()} id="links" disabled/>
            <Spacer h={0.5}/>
            <Input width="100%" key="discordtags" label="Discord Tags" value={curSubmission?.discordTags?.join()} id="discordTags" disabled/>
            <Spacer h={0.5}/>
            <Input width="100%" key="videolink" label="Video Link" value={curSubmission?.videoLink} id="videoLink" disabled/>
            <Spacer h={0.5}/>
            <Button type="error" onClick={deleteSubmission}>Delete Submission</Button>
            <Spacer h={0.5}/>
            <Text>Submission Accolades:</Text>
            <Select placeholder="Award Accolade(s)" multiple value={curSubmission?.accoladeIds} onChange={(s:any) => setCurSubmission((prev:any) => ({...prev, accoladeIds: s}))}>
              {curEvent?.accolades.map(accolade => {
                return <Select.Option key={accolade._id} value={accolade._id}>{accolade.name}</Select.Option>
              })}
            </Select>
            <Spacer h={0.5}/>
            <Button onClick={updateSubmissionAccolades}>Update Submission Accolade</Button>
          </Card.Content>
        </Card>
        <Spacer h={0.5}/>
        {curEvent && curEvent.submissions.map(submission => 
          (
            <React.Fragment key={submission._id}>
              <Card>
                <Text>{submission.name}</Text>
                <Button auto scale={0.5} value={submission._id} onClick={() => handleEditSubmission(submission._id)}>Edit</Button>
              </Card>
              <Spacer h={0.5}/>
            </React.Fragment>
          )
        )}
        </Fieldset>
      </Fieldset.Group>
      </>
      }
    </>)
  }
};
