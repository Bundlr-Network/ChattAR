import { WebBundlr } from '@bundlr-network/client/build/web';
import React from 'react'
import toast from 'react-simple-toasts';
import TextareaAutosize from 'react-textarea-autosize';
import { arweave, getTopicString } from '../lib/api';

export const NewPost = (props) => {
  const [topicValue, setTopicValue] = React.useState("");
  const [postValue, setPostValue] = React.useState("");
  const [isPosting, setIsPosting] = React.useState(false);
  function onTopicChanged(e) {
    let input = e.target.value;
    let dashedTopic = getTopicString(input);
    setTopicValue(dashedTopic);
  }

  async function onPostButtonClicked() {
    setIsPosting(true);
    const tags: any[] = [];
    const bundlr = props.bundlr as WebBundlr;
    
    tags.push(
      {name: "Application", value:"ChattAR" },
      {name: "Content-Type", value: "text/plain"},
      {name: "Version", value: "1"},
      {name: "Type", value: "post"}
    )


    if (topicValue) {
      tags.push({name: "Topic", value: topicValue})

    }

    let tx = await bundlr.createTransaction(postValue, { tags })
    await tx.sign()
    const txMeta = await tx.upload().catch(e =>{
      console.log(`Error posting message - ${e.stackTrace ?? e}`)
      toast(`Error Posting message - ${e.message ?? e}`)
    })

    setIsPosting(false);
    setPostValue("");
    setTopicValue("");
    if (props.onPostMessage) {
      props.onPostMessage(tx.id);
    }
  }

  let isDisabled = postValue === "";
  console.log(props)
  if (props.bundlr) {
    if (isPosting) {
      return (
        <div className="newPost">
          <div className="newPostScrim" />
          <TextareaAutosize
            value={postValue}
            readOnly={true}
          />
          <div className="newPost-postRow">
            <div className="topic">
              #
              <input
                type="text"
                placeholder="topic"
                className="topicInput"
                value={topicValue}
                disabled={true}
              />
            </div>
            <div >
              <button
                className="submitButton"
                disabled={true}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="newPost">
          <TextareaAutosize
            value={postValue}
            onChange={e => setPostValue(e.target.value)}
            rows={1}
            placeholder="What do you have to say?"
          />
          <div className="newPost-postRow">
            <div className="topic"
              style={{ color: topicValue && "rgb( 80, 162, 255)" }}
            >
              #
              <input
                type="text"
                placeholder="topic"
                className="topicInput"
                value={topicValue}
                onChange={e => onTopicChanged(e)}
              />
            </div>
            <div >
              <button
                className="submitButton"
                disabled={isDisabled}
                onClick={onPostButtonClicked}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )
    }
  } else {
    return (<div className="darkRow">Connect your wallet to start posting...</div>)
  }
};
