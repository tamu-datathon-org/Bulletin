import { Button, ButtonGroup, Link, Card, Divider, Input, Radio, Spacer, useToasts, Text, Collapse, Display, Image } from "@geist-ui/react";
import axios from 'axios';
import { X, XCircle } from '@geist-ui/react-icons';
import Select from 'react-select'
import React, { useEffect, useState } from 'react';
import { BASE_URL, HARMONIA_URL, MAX_TEAMMATES } from "../../constants";
import { ChallengesResponse, Challenge, Submission, SubmissionResponse, FileType, SubmissionsResponse, HarmoniaResponse } from '../interfaces';
import { CUR_EVENT_ID } from "../Admin";

export const authRedirector = (res:any) => {
  if (res?.response?.status === 307) {
    window.location.replace(`https://tamudatathon.com${String(res.response.data.error)}`);
  }
}

export const ProjectPage: React.FC = () => {
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

    const urlRegex = "((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";
 
    const [allChalleges, setAllChallenges] = useState<Challenge[]>([])
    const [submissions, setSubmissions] = useState<Submission[]>([])
    useEffect(() => {
      let mounted = true
      axios.get<ChallengesResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}/challenge`)
      .then(res => {
        if (mounted){
          setAllChallenges(res.data.result)
        }
      })
      .catch(errorHandler)

      axios.get<SubmissionsResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/user`)
      .then(res => {
        if (mounted){
          setSubmissions(res.data.result)
        }
      })
      .catch(errorHandler)
      if (!discordUsers) {
        axios.get<HarmoniaResponse>(`${HARMONIA_URL}/api/users`)
        .then(res => {
          if (mounted){
            const result = res.data.result.map(discordUser => {
              const d = {
                value: discordUser,
                label: discordUser.substr(0, discordUser.lastIndexOf('#')),
              }
              return d;
            });
            setDiscordUsers(result);
          }
        })
        .catch(errorHandler)
      }
      return () => {
        mounted = false;
      }
    },[]) // eslint-disable-line react-hooks/exhaustive-deps

    const [submission, setSubmission] = useState<Submission>();
    const submissionDataHandler = (e:any) => setSubmission((prev:any) => ({
        ...prev,
        [e.target.id]: e.target.value,
    }));

    const emptyCurSubmission = () => setSubmission({
      _id: "",
      name: "",
      tags: [],
      links: [],
      discordTags: [],
      challengeId: "",
      videoLink: "",
      answer1: "",
      answer2: "",
      answer3: "",
      answer4: "",
      answer5: "",
      sourceCode: [],
      photos: {},
      icon: [],
      markdown: [],
      accoladeIds: []
    })

    const handleUpdateSubmission = () => {
      submission!.discordTags = discordTags || [];
      submission!.tags = tags || [];
      submission!.links = links || [];
      axios.post(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/add`, submission)
      .then(() => {
        sendNotification("Updated submission!", "success")
        emptyCurSubmission();
      })
      .catch(errorHandler)
      if (!submission?._id) {
        sendNotification("Submission Failed!", "error");
        return;
      }
      if (sourceCode) uploadFile(FileType.sourceCode);
      if (icon) uploadFile(FileType.icon);
      if (photos) uploadPhotos();
    };

    const handleEditSubmission = (id:string) => {
      axios.get<SubmissionResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${id}`)
      .then(res => setSubmission(res.data.result))
      .catch(errorHandler);
    }

    const [tags, setTags] = useState<any>();
    const tagsHandler = (e:any) => {
      if (["Enter", "Tab", ","].includes(e.key)) {
        e.preventDefault();
        const value = e.target.value.trim();
        if (!tags) {
          setTags([value]);
          e.target.value = "";
          return;
        }
        if (tags.includes(value)) {
          sendNotification("Tag is already present.", "error");
          return;
        }
        e.target.value = "";
        setTags([...tags, value]);
      }
    }
    const handleDeleteTags = (e:any, item: string) => {
      setTags(tags?.filter((i:string) => i !== item) || []);
    };

    const [discordTags, setDiscordTags] = useState<any>();
    const discordTagsHandler = (e:any) => {
      if (["Enter", "Tab", ","].includes(e.key)) {
        e.preventDefault();
        const value = e.target.value.trim();
        if (!discordTags) {
          setDiscordTags([value]);
          e.target.value = "";
          return;
        }
        if (discordTags.includes(value)) {
          sendNotification("Discord tag is already present.", "error");
          return;
        }
        e.target.value = "";
        setDiscordTags([...discordTags, value]);
      }
    }
    const handleDeleteDiscordTags = (e:any, item: string) => {
      setDiscordTags(discordTags?.filter((i:string) => i !== item) || []);
    };

    // show the user all the discord tags in a dropdown
    const [discordUsers, setDiscordUsers] = useState<any>();

    const [links, setLinks] = useState<any>();
    const linksHandler = (e:any) => {
      if (["Enter", "Tab", ","].includes(e.key)) {
        e.preventDefault();
        const value = e.target.value.trim();
        if (!links) {
          setLinks([value]);
          e.target.value = "";
          return;
        }
        if (links.includes(value)) {
          sendNotification("Link is already present.", "error");
          return;
        }
        e.target.value = "";
        setLinks([...links, value]);
      }
    }
    const handleDeleteLinks = (e:any, item: string) => {
      setLinks(links?.filter((i:string) => i !== item) || []);
    };

    const [sourceCode, setSourceCode] = useState<any>();
    const sourceCodeHandler = (e:any, add:boolean) => {
      if (!(add ?? true)) {
        setSourceCode(null);
        e.target.files = [];
        e.target.value = "";
      } else {
        setSourceCode(e.target.files[0]);
      }
    }

    const [photos, setPhotos] = useState<any>();
    const photosHandler = (e:any, index:number, add:boolean) => {
      if (!photos) {
        setPhotos(new Array(3).fill(null));
      }
      if (!(add ?? true)) {
        photos[index] = null;
        e.target.files = [];
        e.target.value = "";
      } else {
        photos[index] = e.target.files[0];
      }
      setPhotos(photos);
    }

    const [icon, setIcon] = useState<any>();
    const iconHandler = (e:any, add:boolean) => {
      if (!(add ?? true)) {
        setIcon(null);
        e.target.files = [];
        e.target.value = "";
      } else {
        setIcon(e.target.files[0]);
      }
    }

    const uploadFile = (type:FileType) => {
      const data = new FormData();
      if (type === 'sourceCode') data.append('file', sourceCode);
      else if (type === 'icon') data.append('file', icon);
      else {
        sendNotification("Incompatible submission file upload detected. Please contact an organizer.", "error");
      }
      axios.post(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${submission?._id}/upload/${type}`, data)
      .then(() => sendNotification(`Uploaded ${type}!`, "success"))
      .catch(errorHandler)
    }

    const uploadPhotos = () => {
      if (!photos) return;
      photos.forEach((photo:Blob, index:number) => {
        const data = new FormData();
        data.append('file', photo);
        axios.post(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${submission?._id}/upload/photo/${index}`, data)
        .then(() => sendNotification(`Uploaded Photo ${index}!`, "success"))
        .catch(errorHandler)
      })
    }

    return (
    <>
      <Card>
        <Card.Content>
        <Text b>Add/Update a Submission</Text>
        </Card.Content>
        <Divider />
        <Card.Content>
        <Input width="100%" key="name" label="Name" value={submission?.name} id="name" onChange={submissionDataHandler} placeholder="Give your project a name" />
        <Spacer h={1}/>
        <ButtonGroup type="success">
        {tags?.map((item: any, idx:number) =>
          <Button onClick={(e) => handleDeleteTags(e, item)} icon={<X />} auto id={item} key={idx}>{item}</Button>
        )}
        </ButtonGroup>
        <Input width="100%" label="Tags" id="tags" onKeyDown={tagsHandler} placeholder="Enter tags related to your project, eg. Data"/>
        <Spacer h={1}/>
        <ButtonGroup type="success">
        {links?.map((item: any, idx:number) =>
          <Button onClick={(e) => handleDeleteLinks(e, item)} icon={<X />} auto id={item} key={idx}>{item}</Button>
        )}
        </ButtonGroup>
        <Input width="100%" pattern={urlRegex} label="Links" id="links" onKeyDown={linksHandler} placeholder="Enter relevant project links here, eg. https://github.com/..." />
        <Spacer h={1}/>
        <ButtonGroup type="success">
        {discordTags?.map((item: any, idx:number) =>
          <Button onClick={(e) => handleDeleteDiscordTags(e, item)} icon={<X />} auto id={item} key={idx}>{item}</Button>
        )}
        </ButtonGroup>
        <Select placeholder="Add Teammates From Discord"
            options={
              discordTags?.length >= MAX_TEAMMATES ? [] : discordUsers
            }
            onChange={discordTagsHandler}
            closeMenuOnSelect={false}
            isMulti={false}
        />
        <Spacer h={1}/>
        <Input width="100%" key="videolink" pattern={urlRegex} label="Video Link" value={submission?.videoLink} id="videoLink" onChange={submissionDataHandler} placeholder="Link a youtube, vimeo, etc. video about your project" />
        <Spacer h={1}/>
        <Text>Select a challenge to submit this project to:</Text>
        <Radio.Group useRow value={submission?.challengeId} onChange={(c:any) => setSubmission((prev:any) => ({...prev, challengeId: c}))}>
          {allChalleges.map(challenge => <Radio key={challenge._id} value={challenge._id}>{challenge.name}</Radio>)}
        </Radio.Group>
        <Spacer h={1}/>
        {allChalleges.filter(challenge => challenge._id === submission?.challengeId).map(challenge =>
            <>
              <Text>Challenge Specific Questions</Text>
              {challenge.question1 && <Input width="100%" label={challenge?.question1} value={submission?.answer1} key="answer1" id="answer1" onChange={submissionDataHandler}/>}
              {challenge.question2 && <Input width="100%" label={challenge?.question2} value={submission?.answer2} key="answer2" id="answer2" onChange={submissionDataHandler}/>}
              {challenge.question3 && <Input width="100%" label={challenge?.question3} value={submission?.answer3} key="answer3" id="answer3" onChange={submissionDataHandler}/>}
              {challenge.question4 && <Input width="100%" label={challenge?.question4} value={submission?.answer4} key="answer4" id="answer4" onChange={submissionDataHandler}/>}
              {challenge.question5 && <Input width="100%" label={challenge?.question5} value={submission?.answer5} key="answer5" id="answer5" onChange={submissionDataHandler}/>}
            </>
        )}
        <Spacer h={1}/>
        <Collapse.Group>
          <Collapse style={{display:'block'}} shadow title="Icon" subtitle="Upload an image that everyone will see in the Project Gallary">
          <Card>
            <Link href={submission?.icon?.[1] ?? "#"} icon block color>Project Cover Image (.jpg, .png)</Link>
            <Input htmlType="file" accept=".jpg,.png" name="Icon" onChange={(e) => iconHandler(e, true)} iconClickable iconRight={<XCircle />} onIconClick={(e) => iconHandler(e, false)}/>
            <Spacer h={1}/>
            <Display shadow>
              <Image width="500px" height="500px" src={icon || ""} />
            </Display>
          </Card>
          </Collapse>
          <Spacer h={1}/>
          <Collapse style={{display:'block'}} shadow title="Source Code" subtitle="Upload source code like a python notebook to show what you did">
          <Card>
            <Link href={submission?.sourceCode?.[1] ?? "#"} icon block color>Source Code (.tar, .tar.gz, .zip)</Link>
            <Input htmlType="file" accept=".tar,.tar.gz,.zip" name="Source Code" onChange={(e) => sourceCodeHandler(e, true)} iconClickable iconRight={<XCircle />} onIconClick={(e) => sourceCodeHandler(e, false)}/>
            <Spacer h={1}/>
            <Display shadow>
              <Image width="500px" height="500px" src={sourceCode || ""} />
            </Display>
          </Card>
          </Collapse>
          <Spacer h={1}/>
          <Collapse style={{display:'block'}} shadow title="Images" subtitle="Upload up to 3 images concerning your project">
            <Card>
              <Text>Project Image 1</Text>
              <Input htmlType="file" accept=".jpg,.png" name="Photo0" onChange={(e) => photosHandler(e, 0, true)} iconClickable iconRight={<XCircle />} onIconClick={(e) => photosHandler(e, 0, false)}/>
              <Spacer h={1}/>
              <Display shadow>
                <Image width="500px" height="500px" src={photos?.[0] || ""} />
              </Display>
            </Card>
            <Spacer h={1}/>
            <Card>
              <Link href={submission?.photos?.["1"]?.[1] ?? "#"} icon block color>Project Image 2</Link>
              <Input htmlType="file" accept=".jpg,.png" name="Photo1" onChange={(e) => photosHandler(e, 1, true)} iconClickable iconRight={<XCircle />} onIconClick={(e) => photosHandler(e, 1, false)}/>
              <Spacer h={1}/>
              <Display shadow>
                <Image width="500px" height="500px" src={photos?.[1] || ""} />
              </Display>
            </Card>
            <Spacer h={1}/>
            <Card>
              <Link href={submission?.photos?.["2"]?.[1] ?? "#"} icon block color>Project Image 3</Link>
              <Input htmlType="file" accept=".jpg,.png" name="Photo2" onChange={(e) => photosHandler(e, 2, true)} iconClickable iconRight={<XCircle />} onIconClick={(e) => photosHandler(e, 2, false)}/>
              <Spacer h={1}/>
              <Display shadow>
                <Image width="500px" height="500px" src={photos?.[2] || ""} />
              </Display>
            </Card>
          </Collapse>
        </Collapse.Group>
        <Spacer h={1}/>
        <Button onClick={handleUpdateSubmission}>{submission?._id ? "Update" : "Add"}</Button>
        </Card.Content>
      </Card>
      <Spacer h={0.5}/>
      {submissions?.filter(submission => (submission && submission._id)).map(submission => (
          <React.Fragment key={submission._id}>
            <Card>
              <Text>{submission.name}</Text>
              <Button auto scale={0.5} value={submission._id} onClick={() => handleEditSubmission(submission._id)}>Edit</Button>
            </Card>
            <Spacer h={0.5}/>
          </React.Fragment>
        )
      )}
    </>
    );
};