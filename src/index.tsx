import { registerDetailsViewHeaderAction, K8s } from '@kinvolk/headlamp-plugin/lib';
import { config } from './config';
import { ActionButton, Loader } from '@kinvolk/headlamp-plugin/lib/CommonComponents';


// Below are some imports you may want to use.
//   See README.md for links to plugin development documentation.
// import { SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
// import { K8s } from '@kinvolk/headlamp-plugin/lib/K8s';
// import { Typography } from '@material-ui/core';

import { OpenAIClient, AzureKeyCredential } from  "@azure/openai";
import { prompt } from './config/prompt';
import React from 'react';
import TextStream from './textstream';
import AIModal from './podModal';

const client = new OpenAIClient(
  `https://${config.openApiName}.openai.azure.com/`, 
  new AzureKeyCredential(config.openApiKey)
);



function AnalyzePod(props) {
    const item = props.item;
    console.log(item)
    if(!item) {
        return null
    }
    const [textStream, setTextStream] = React.useState('');
    const [openPopup, setOpenPopup] = React.useState(false);

    async function analyzePod() {
            setOpenPopup(true);
            const events = client.listChatCompletions("gpt-35-turbo", [{ role: "user", content: `${prompt.pod_error}${JSON.stringify(item.jsonData)}
            ` }])
            for await (const event of events) {
                for (const choice of event.choices) {
                  const delta = choice.delta?.content;
                  if (delta !== undefined) {
                    setTextStream(delta);
                  }
                }
             
            }
    }

    return item && <>
     <AIModal openPopup={openPopup} setOpenPopup={setOpenPopup}> {
        textStream === "" ? <Loader /> : <TextStream incomingText={textStream}/>}</AIModal> 
    {<ActionButton icon={"mdi:sine-wave"} description='Analyze' onClick={() => {
        analyzePod()
    }}/>
    }
     
    </>;
}

registerDetailsViewHeaderAction(AnalyzePod);

