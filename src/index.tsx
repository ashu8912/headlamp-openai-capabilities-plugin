import { registerDetailsViewHeaderAction, K8s } from '@kinvolk/headlamp-plugin/lib';
import { FormControl, InputLabel, InputAdornment, OutlinedInput, Button, Box, Chip } from '@material-ui/core';
import { config } from './config';
import { ActionButton, Loader } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Icon } from '@iconify/react';

// Below are some imports you may want to use.
//   See README.md for links to plugin development documentation.
// import { SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
// import { K8s } from '@kinvolk/headlamp-plugin/lib/K8s';
// import { Typography } from '@material-ui/core';

import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { prompt } from './config/prompt';
import React, { useEffect, useState } from 'react';
import TextStream from './textstream';
import AIModal from './modal';

const client = new OpenAIClient(
  `https://${config.openApiName}.openai.azure.com/`,
  new AzureKeyCredential(config.openApiKey)
);

function DeploymentAIPrompt(props) {
  const item = props.item;

  const [textStream, setTextStream] = useState('');
  const [chatReply, setChatReply] = useState('');
  const [openPopup, setOpenPopup] = useState(false);
  const [userSkill, setUserSkill] = useState('novice')
  const [expertiseLevel, setExpertiseLevel] = useState(prompt.expertise[userSkill])
  const [userAction, setUserAction] = useState('explain')
  const [currentAction, setCurrentAction] = useState(prompt.actions[userAction])
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);

  let allPromptActions = prompt.actions;
  let availablePromptActions = []
  let availableLevels = []

  useEffect(
    () => {
      setExpertiseLevel(prompt.expertise[userSkill])
    }, [userSkill]
  )

  useEffect(
    () => {
      setTextStream(chatReply)
    }, [chatReply]
  )

  if (!item) {
    return null
  }


  if (item && item.kind === "Deployment") {
    // availablePromptActions.push("Scale if cpu usage goes up by 40%")
  }

  // creates a keyword list using the keys of the actions
  for (const action in allPromptActions) {
    console.log("print", action)
    availablePromptActions.push(action)
  }

  // creates a keyword list using the expertise keys
  for (const level in prompt.expertise) {
    console.log("skill", level)
    availableLevels.push(level)
  }

  function handleChange(event) {
    setInputVal(event.target.value);
  }



  async function AnalyzeResourceBasedOnPrompt() {
    setOpenPopup(true);
    const expertiseInstruction = expertiseLevel
    let customPrompt = `${prompt.settings.role} ${prompt.instruction.base} ${expertiseInstruction} ${currentAction} ${inputVal} ${JSON.stringify(item.jsonData)}`
    const events = client.listChatCompletions("gpt-35-turbo", [{
      role: "user", content: `${customPrompt} `
    }])

    let response = '';

    try {
      for await (const event of events) {
        for (const choice of event.choices) {
          const delta = choice.delta?.content;
          if (delta !== undefined) {
            response += delta
          }
        }
      }
    } finally {
      setLoading(false);
    }

    console.log(customPrompt)
    setChatReply(response)
  }

  return <>
    <AIModal openPopup={openPopup} setOpenPopup={setOpenPopup} title="AI Analysis" backdropClickCallback={() => setTextStream('')}>

      current skill level: {userSkill}
      <Box>
        {/* map over each expertise, if the current expertise state !== button value then not styled */}
        {availableLevels.map((level) => {
          return <Button
            key={level}
            style={{ margin: `0.5em` }}
            color={level === userSkill ? 'primary' : 'default'}
            variant={'outlined'}
            onClick={() => { setUserSkill(level) }}
          >
            {level}
          </Button>
        })}
      </Box>

      {
        <Box display="flex" mb={2} flexWrap="wrap" direction="column">
          {
            availablePromptActions.map((action) => {
              return <Box m={1}>
                <Chip label={action} onClick={() => {
                  setUserAction(action)
                }}
                />
              </Box>
            })}
        </Box>
      }
      <FormControl fullWidth variant="outlined">

        <InputLabel htmlFor="deployment-ai-prompt">Enter your prompt here</InputLabel>
        <OutlinedInput
          id="deployment-ai-prompt"
          onChange={handleChange}
          labelWidth={160}
          placeholder={userAction ? `Please ${userAction} the following...` : ''}
          value={inputVal}
          endAdornment={
            <InputAdornment position="end">
              <ActionButton
                icon="mdi:close"
                description="Clear"
                onClick={() => {
                  setInputVal('');
                }}
              />
            </InputAdornment>
          }
        />
        <Box mt={1}>
          <Button variant="outlined" onClick={() => {
            setLoading(true);
            AnalyzeResourceBasedOnPrompt()
          }}>Check</Button>
        </Box>
      </FormControl>

      {
        loading ? <Loader /> : textStream !== "" && <TextStream incomingText={textStream} callback={() => {
          setOpenPopup(false);
        }} />
      }
    </AIModal>
    <ActionButton icon="mdi:brain" description='AI Analysis' onClick={() => {
      setOpenPopup(true);
    }} /></>

}

registerDetailsViewHeaderAction(DeploymentAIPrompt)