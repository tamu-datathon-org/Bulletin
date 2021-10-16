import { Button, ButtonGroup, Badge, Textarea, Link, Card, Divider, Input, Radio, Spacer, useToasts, Text, Collapse, Display, Image } from "@geist-ui/react";
import axios from 'axios';
import { X, Eye, Youtube, Tag, Link2 } from '@geist-ui/react-icons';
import Select from 'react-select'
import { useCookies } from 'react-cookie';
import React, { useEffect, useState } from 'react';
import { BASE_URL, HARMONIA_URL, MAX_TEAMMATES, MAX_LINKS, MAX_TAGS } from "../../constants";
import { ChallengesResponse, Challenge, Submission, SubmissionResponse, FileType, SubmissionsResponse, HarmoniaResponse, MarkdownResponse } from '../interfaces';
import { CUR_EVENT_ID } from "../Admin";
import placeholder from '../Gallery/placeholder.jpg';
const marked = require("marked");

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

    const [markdownValue, setMarkdownValue] = useState("")
    const [markdownLoaded, setMarkdownLoaded] = useState(false);
    const retrieveMarkdown = () => {
      axios.get<MarkdownResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${submission?._id}/markdown`)
      .then(res => {
          setMarkdownValue(res.data.result.text)
          setMarkdownLoaded(true);
      })
      .catch(errorHandler)
    }

    // eslint-disable-next-line no-useless-escape
    const urlRegex = /https?:\/\/(www\\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi

    const [cookies] = useCookies(['accessToken']);
 
    const [allChalleges, setAllChallenges] = useState<Challenge[]>([])
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [discordUsers, setDiscordUsers] = useState<any>([]);
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
        const options = {
          headers: {
            cookie: `accessToken=${cookies?.accessToken || ""}`,
          },
        };
        console.log(JSON.stringify(options));
        axios.get<HarmoniaResponse>(`${HARMONIA_URL}/api/users`, options)
        .then(res => {
          if (mounted) {
            setDiscordUsers(res.data?.discordUsers || []);
          }
        })
        .catch(errorHandler)
        setDiscordUsers(['testuser1', 'testuser2']);
      }
      retrieveMarkdown();
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
      accoladeIds: [],
      submission_time: null,
    })

    const uploadMarkdown = () => {
      axios.post(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${submission?._id}/markdown`, {text: markdownValue})
      .catch(errorHandler)
    }

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
      if (markdownLoaded) uploadMarkdown();
      if (sourceCode) uploadFile(FileType.sourceCode);
      if (icon) uploadFile(FileType.icon);
      if (photos) uploadPhotos();
    };

    const handleEditSubmission = (id:string) => {
      axios.get<SubmissionResponse>(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${id}`)
      .then(res => setSubmission(res.data.result))
      .catch(errorHandler);
      setDiscordTags(submission?.discordTags || []);
      setTags(submission?.tags || []);
      setLinks(submission?.links || []);
      retrieveMarkdown();
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
          return;
        }
        if (discordTags.includes(value)) {
          sendNotification("Discord tag is already present.", "error");
          return;
        }
        setDiscordTags([...discordTags, value]);
      }
    }
    const handleDeleteDiscordTags = (e:any, item: string) => {
      setDiscordTags(discordTags?.filter((i:string) => i !== item) || []);
    };

    const [links, setLinks] = useState<any>();
    const linksHandler = (e:any) => {
      if (["Enter", "Tab", ","].includes(e.key)) {
        e.preventDefault();
        const value = e.target.value.trim();
        if (!urlRegex.test(value)) {
          sendNotification("Link is not valid.", "error");
          return;
        }
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

    const [previewedLink, setPreviewedLink] = useState<any>();
    const videoLinkHandler = () => {
      const value = submission?.videoLink || "";
      if (!urlRegex.test(value)) {
        sendNotification("Link is not valid.", "error");
        return;
      }
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = value.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;
      setPreviewedLink(`//www.youtube.com/embed/${videoId}`);
    };

    const [sourceCode, setSourceCode] = useState<any>();
    const sourceCodeHandler = (e:any) => {
      setSourceCode(e.target.files[0]);
    }

    const [photos, setPhotos] = useState<any>();
    const photosHandler = (e:any, index:number) => {
      if (!photos) {
        setPhotos(new Array(3).fill(null));
      }
      photos[index] = e.target.files[0];
      setPhotos(photos);
    }

    const [icon, setIcon] = useState<any>();
    const iconHandler = (e:any) => {
      setIcon(e.target.files[0]);
    }

    const uploadFile = (type:FileType) => {
      const data = new FormData();
      if (type === 'sourceCode' && sourceCode) {
        data.append('file', sourceCode);
      } else if (type === 'icon' && icon) {
        data.append('file', icon);
      } else {
        sendNotification("Incompatible submission file upload detected. Please contact an organizer.", "error");
      }
      axios.post(`${BASE_URL}/api/${CUR_EVENT_ID}/submission/${submission?._id}/upload/${type}`, data)
      .then(() => sendNotification(`Uploaded ${type}!`, "success"))
      .catch(errorHandler)
    }

    const uploadPhotos = () => {
      if (!photos) return;
      photos.forEach((photo:Blob, index:number) => {
        if (!photo) return;
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
        <Text h2>Add/Update a Submission</Text>
        </Card.Content>
        <Divider />
        <Card.Content>
        <Spacer h={1}/>
        <Text span type="secondary">Details</Text>
        <Spacer h={1}/>
        <Input width="100%" key="name" label="Name" value={submission?.name} id="name" onChange={submissionDataHandler} placeholder="Give your project a name" />
        <Spacer h={1}/>
        <Badge>{MAX_TEAMMATES - (discordTags?.length ?? 0)}</Badge>
        <ButtonGroup type="success" width="100%">
        {discordTags?.map((item: any, idx:number) =>
          <Button onClick={(e) => handleDeleteDiscordTags(e, item)} icon={<X />} auto id={item} key={idx}><Text span style={{ textTransform: 'none' }}>{item}</Text></Button>
        )}
        </ButtonGroup>
        <Select placeholder="Add Teammates From Discord 👾"
            options={
              discordTags?.length >= MAX_TEAMMATES ? [] : discordUsers
            }
            onChange={discordTagsHandler}
            closeMenuOnSelect={false}
            isMulti={false}
        />
        <Spacer h={1}/>
        <Badge>{MAX_TAGS - (tags?.length ?? 0)}</Badge>
        <ButtonGroup type="secondary" width="100%">
        {tags?.map((item: any, idx:number) =>
          <Button onClick={(e) => handleDeleteTags(e, item)} icon={<X />} auto id={item} key={idx}><Text span style={{ textTransform: 'none' }}>{item}</Text></Button>
        )}
        </ButtonGroup>
        <Input icon={<Tag />} width="100%" label="Tags" id="tags" onKeyDown={tagsHandler} placeholder="Enter tags related to your project, eg. Data"/>
        <Spacer h={1}/>
        <Badge>{MAX_LINKS - (links?.length ?? 0)}</Badge>
        <ButtonGroup type="success" width="100%" >
        {links?.map((item: any, idx:number) =>
          <Button onClick={(e) => handleDeleteLinks(e, item)} icon={<X />} auto id={item} key={idx}><Text span style={{ textTransform: 'none' }}>{item}</Text></Button>
        )}
        </ButtonGroup>
        <Input icon={<Link2 />} width="100%" label="Links" id="links" onKeyDown={linksHandler} placeholder="Enter relevant project links here, eg. https://github.com/..." />
        <Spacer h={1}/>
        <Input icon={<Youtube />} width="100%" key="videolink" label="Video Link" value={submission?.videoLink} id="videoLink" onChange={submissionDataHandler} placeholder="Link a YouTube video presenting your project" iconClickable iconRight={<Eye />} onIconClick={videoLinkHandler} />
        {previewedLink && <Display shadow><iframe title="VideoLinkPreview" src={previewedLink}></iframe></Display>}
        <Spacer h={1}/>
        <Divider />
        <Spacer h={1}/>
        <Text span type="secondary">Challenge Specific</Text>
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
        <Divider />
        <Spacer h={1}/>
        <Text span type="secondary">Supporting Information</Text>
        <Spacer h={1}/>
        <Collapse.Group>
          <Collapse style={{display:'block'}} shadow title="Description" subtitle="Explain how you created your project">
          <Card>
          <Text>Input:</Text>
          <Textarea width="100%"
            value={markdownValue}
            onChange={(e) => setMarkdownValue(e.target.value)}
            placeholder="Input your Markdown Description here."
            resize="vertical"
          />
            <Spacer h={1}/>
            <Text>Preview:</Text>
            <Card>
              <div dangerouslySetInnerHTML={{__html: marked(markdownValue)}} />
            </Card>
          </Card>
          </Collapse>
          <Spacer h={1}/>
          <Collapse style={{display:'block'}} shadow title="Icon" subtitle="Upload an image that everyone will see in the Project Gallary">
          <Card>
            {submission?.icon?.[1] && <Link href={submission?.icon?.[1] ?? "#"} icon block color>Project Cover Image (.jpg, .png)</Link>}
            <Input htmlType="file" accept=".jpg,.png" name="Icon" onChange={iconHandler} />
            <Spacer h={1}/>
            {submission?.icon?.[1] && <Display shadow><Image width="300px" height="300px" src={submission?.icon?.[1] || placeholder} /></Display>}
          </Card>
          </Collapse>
          <Spacer h={1}/>
          <Collapse style={{display:'block'}} shadow title="Source Code" subtitle="Upload source code like a python notebook to show what you did">
          <Card>
            {submission?.sourceCode?.[1] && <Link href={submission?.sourceCode?.[1] ?? "#"} icon block color>Source Code (.tar, .tar.gz, .zip)</Link>}
            <Input htmlType="file" accept=".tar,.tar.gz,.zip" name="Source Code" onChange={sourceCodeHandler} />
          </Card>
          </Collapse>
          <Spacer h={1}/>
          <Collapse style={{display:'block'}} shadow title="Images" subtitle="Upload up to 3 images concerning your project">
            <Card>
              {submission?.photos?.["0"]?.[1] && <Link href={submission?.photos?.["0"]?.[1] ?? "#"} icon block color>Project Image 1</Link>}
              <Input htmlType="file" accept=".jpg,.png" name="Photo0" onChange={(e) => photosHandler(e, 0)} />
              <Spacer h={1}/>
              {submission?.photos?.["0"]?.[1] && <Display shadow><Image width="500px" height="500px" src={submission?.photos?.["0"]?.[1] || placeholder} /></Display>}
            </Card>
            <Spacer h={1}/>
            <Card>
              {submission?.photos?.["1"]?.[1] && <Link href={submission?.photos?.["1"]?.[1] ?? "#"} icon block color>Project Image 2</Link>}
              <Input htmlType="file" accept=".jpg,.png" name="Photo1" onChange={(e) => photosHandler(e, 1)} />
              <Spacer h={1}/>
              {submission?.photos?.["1"]?.[1] && <Display shadow><Image width="500px" height="500px" src={submission?.photos?.["1"]?.[1] || placeholder} /></Display>}
            </Card>
            <Spacer h={1}/>
            <Card>
              {submission?.photos?.["2"]?.[1] && <Link href={submission?.photos?.["2"]?.[1] ?? "#"} icon block color>Project Image 3</Link>}
              <Input htmlType="file" accept=".jpg,.png" name="Photo2" onChange={(e) => photosHandler(e, 2)} />
              <Spacer h={1}/>
              {submission?.photos?.["2"]?.[1] && <Display shadow><Image width="500px" height="500px" src={submission?.photos?.["2"]?.[1] || placeholder} /></Display>}
            </Card>
          </Collapse>
        </Collapse.Group>
        <Spacer h={1}/>
        <Divider />
        <Spacer h={1}/>
        <Display>
          <Button shadow type="secondary" onClick={handleUpdateSubmission}><Text b>{submission?._id ? "Update" : "Add"}</Text></Button>
        </Display>
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