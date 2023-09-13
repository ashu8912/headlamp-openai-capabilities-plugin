import { useState, useEffect, useRef } from 'react';
import { Typography, Box } from '@material-ui/core';
import './TextStream.css'; // Import the CSS file

const TextStream = ({ incomingText }) => {
  const [textStream, setTextStream] = useState([]);
  const messageContainerRef = useRef(null);

  // Blinking indicator state
  const [blinking, setBlinking] = useState(false);

  // Update the textStream state when new text arrives
  useEffect(() => {
    if (incomingText) {
      setTextStream((prevStream) => [...prevStream, incomingText]);
      // Start blinking when new text arrives
      setBlinking(true);
    }
  }, [incomingText]);

  // Scroll to the latest message when new messages arrive
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [textStream]);

  // Toggle blinking indicator every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking((prevBlinking) => !prevBlinking);
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="text-stream-container">
      <div className="text-stream-messages" ref={messageContainerRef}>
      <Box
            display="flex"
            flexWrap="wrap"
          >
        {textStream.map((text, index) => (
           <Box m={1}>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'normal', // Allow text to wrap
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%', // Ensure messages take up the entire width
              }}
              className={`text-stream-message`}
            >
              {text}
            </Typography>
            {index === textStream.length - 1 && blinking && (
              <span className="blinking-indicator">...</span>
            )}
            </Box>
         
        ))}
        </Box>
      </div>
    </div>
  );
};

export default TextStream;
