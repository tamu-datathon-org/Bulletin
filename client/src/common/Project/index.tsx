import { Button, ButtonGroup, Link, Card, Divider, Input, Radio, Spacer, useToasts, Text } from "@geist-ui/react";
import axios from 'axios';
import { Upload, X } from '@geist-ui/react-icons';
import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../../constants";
import { ChallengesResponse, Challenge, Submission, SubmissionResponse, FileType, SubmissionsResponse } from '../interfaces';
import { CUR_EVENT_ID } from "../Admin";

export const authRedirector = (res:any) => {
  if (res.response.status === 307) {
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
      return () => {
        mounted = false;
      }
    },[]) // eslint-disable-line react-hooks/exhaustive-deps

    const [submission, setSubmission] = useState<Submission>();
    const submissionDataHandler = (e:any) => setSubmission((prev:any) => (
      {
        ...prev,
        [e.target.id]: ((e.target.id === "name" || e.target.id === "videoLink") ? e.target.value : e.target.value.split(',')),
        discordTags: discordTags,
        tags: tags,
        links: links,
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
      axios.post(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/add`, submission)
      .then(() => {
        sendNotification("Updated submission!", "success")
        emptyCurSubmission();
      })
      .catch(errorHandler)
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
      submissionDataHandler(e);
    }
    const handleDeleteTags = (item: string) => {
      setTags(tags?.filter((i:string) => i !== item) || []);
      submissionDataHandler(null);
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
          sendNotification("Discord Tags is already present.", "error");
          return;
        }
        e.target.value = "";
        setDiscordTags([...discordTags, value]);
      }
      submissionDataHandler(e);
    }
    const handleDeleteDiscordTags = (item: string) => {
      setDiscordTags(discordTags?.filter((i:string) => i !== item) || []);
      submissionDataHandler(null);
    };

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
      submissionDataHandler(e);
    }
    const handleDeleteLinks = (item: string) => {
      setLinks(links?.filter((i:string) => i !== item) || []);
      submissionDataHandler(null);
    };

    const [sourceCode, setSourceCode] = useState<any>();
    const sourceCodeHandler = (e:any) => setSourceCode(e.target.files[0])

    const [photo, setPhoto] = useState<any>();
    const photoHandler = (e:any) => setPhoto(e.target.files[0])

    const [icon, setIcon] = useState<any>();
    const iconHandler = (e:any) => setIcon(e.target.files[0])

    const [markdown, setMarkdown] = useState<any>();
    const markdownHandler = (e:any) => setMarkdown(e.target.files[0])

    const uploadFile = (type:FileType) => {
      const data = new FormData();
      if (type === 'sourceCode') data.append('file', sourceCode);
      else if (type === 'icon') data.append('file', icon);
      else if (type === 'markdown') data.append('file', markdown);
      else {
        sendNotification("Incompatible submission file upload detected. Please contact an organizer.", "error");
      }
      axios.post(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${submission?._id}/upload/${type}`, data)
      .then(() => sendNotification(`Uploaded ${type}!`, "success"))
      .catch(errorHandler)
    }

    const uploadPhoto = (index:number) => {
      const data = new FormData();
      data.append('file', photo);
      axios.post(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${submission?._id}/upload/photo/${index}`, data)
      .then(() => sendNotification(`Uploaded Photo ${index}!`, "success"))
      .catch(errorHandler)
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
        {tags?.map((item: any) =>
          <>
            <Button onClick={() => handleDeleteTags(item)} icon={<X />} auto>{item}</Button>
          </>
        )}
        </ButtonGroup>
        <Input width="100%" key="tags" label="Tags" id="tags" onKeyDown={tagsHandler} placeholder="Enter tags related to your project, eg. Data"/>
        <Spacer h={1}/>
        <ButtonGroup type="success">
        {links?.map((item: any) =>
          <>
            <Button onClick={() => handleDeleteLinks(item)} icon={<X />} auto>{item}</Button>
          </>
        )}
        </ButtonGroup>
        <Input width="100%" key="links" label="Links" id="links" onKeyDown={linksHandler} placeholder="Enter relevant project links here, eg. https://github.com/..." />
        <Spacer h={1}/>
        <ButtonGroup type="success">
        {discordTags?.map((item: any) =>
          <>
            <Button onClick={() => handleDeleteDiscordTags(item)} icon={<X />} auto>{item}</Button>
          </>
        )}
        </ButtonGroup>
        <Input width="100%" key="discordtags" label="Discord Tags" id="discordTags" onKeyDown={discordTagsHandler} placeholder="Enter your teammates discord tags here" />
        <Spacer h={1}/>
        <Input width="100%" key="videolink" label="Video Link" value={submission?.videoLink} id="videoLink" onChange={submissionDataHandler} placeholder="Link a youtube, vimeo, etc. video about your project" />
        <Spacer h={1}/>
        <Text>Select a challenge to submit this project to:</Text>
        <Radio.Group useRow value={submission?.challengeId} onChange={(c:any) => setSubmission((prev:any) => ({...prev, challengeId: c}))}>
          {allChalleges.map(challenge => <Radio key={challenge._id} value={challenge._id}>{challenge.name}</Radio>)}
        </Radio.Group>
        <Spacer h={1}/>
        {allChalleges.filter(challenge => challenge._id === submission?.challengeId).map(challenge =>
            <>
              <Text>Challenge Specific Questions:</Text>
              {challenge.question1 && <Input width="100%" label={challenge?.question1} value={submission?.answer1} key="answer1" id="answer1" onChange={submissionDataHandler}/>}
              {challenge.question2 && <Input width="100%" label={challenge?.question2} value={submission?.answer2} key="answer2" id="answer2" onChange={submissionDataHandler}/>}
              {challenge.question3 && <Input width="100%" label={challenge?.question3} value={submission?.answer3} key="answer3" id="answer3" onChange={submissionDataHandler}/>}
              {challenge.question4 && <Input width="100%" label={challenge?.question4} value={submission?.answer4} key="answer4" id="answer4" onChange={submissionDataHandler}/>}
              {challenge.question5 && <Input width="100%" label={challenge?.question5} value={submission?.answer5} key="answer5" id="answer5" onChange={submissionDataHandler}/>}
            </>
        )}
        <Spacer h={1}/>
        <Button onClick={handleUpdateSubmission}>{submission?._id ? "Update" : "Add"}</Button>
        <Spacer h={1}/>
        <Text>Upload an image that everyone will see in the Project Gallary:</Text>
        <Card>
          <Link href={submission?.icon?.[1] ?? "#"} icon block color>Project Cover Image (.jpg, .png)</Link>
          <Input htmlType="file" accept=".jpg,.png" name="Icon" onChange={iconHandler} iconClickable iconRight={<Upload />} onIconClick={() => uploadFile(FileType.icon)}/>
        </Card>
        <Spacer h={1}/>
        <Text>Upload a markdown file to tell people about your project:</Text>
        <Card>
          <Link href={submission?.markdown?.[1] ?? "#"} icon block color>Description (.md)</Link>
          <Input htmlType="file" accept=".md" name="Markdown" onChange={markdownHandler} iconClickable iconRight={<Upload />} onIconClick={() => uploadFile(FileType.markdown)}/>
        </Card>
        <Spacer h={1}/>
        <Text>Upload source code like a python notebook to show what you did:</Text>
        <Card>
          <Link href={submission?.sourceCode?.[1] ?? "#"} icon block color>Source Code (.tar, .tar.gz, .zip)</Link>
          <Input htmlType="file" accept=".tar,.tar.gz,.zip" name="Source Code" onChange={sourceCodeHandler} iconClickable iconRight={<Upload />} onIconClick={() => uploadFile(FileType.sourceCode)}/>
        </Card>
        <Spacer h={1}/>
        <Text>Upload up to 3 photos about your project:</Text>
        <Card>
          <Link href={submission?.photos?.["0"]?.[1] ?? "#"} icon block color>Project Photo {0 + 1}</Link>
          <Input htmlType="file" accept=".jpg,.png" name="Photo0" onChange={photoHandler} iconClickable iconRight={<Upload />} onIconClick={() => uploadPhoto(0)}/>
        </Card>
        <Spacer h={1}/>
        <Card>
          <Link href={submission?.photos?.["1"]?.[1] ?? "#"} icon block color>Project Photo {0 + 1}</Link>
          <Input htmlType="file" accept=".jpg,.png" name="Photo1" onChange={photoHandler} iconClickable iconRight={<Upload />} onIconClick={() => uploadPhoto(1)}/>
        </Card>
        <Spacer h={1}/>
        <Card>
          <Link href={submission?.photos?.["2"]?.[1] ?? "#"} icon block color>Project Photo {0 + 1}</Link>
          <Input htmlType="file" accept=".jpg,.png" name="Photo2" onChange={photoHandler} iconClickable iconRight={<Upload />} onIconClick={() => uploadPhoto(2)}/>
        </Card>
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