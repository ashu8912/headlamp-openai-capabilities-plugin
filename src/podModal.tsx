import { Dialog } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { DialogContent } from '@material-ui/core';
import React from 'react';

export default function AIModal(props: {
    children: React.ReactNode;
    openPopup: boolean;
    setOpenPopup: (...args) => void;
}) {
  const rootRef = React.useRef(null);
  const { children, openPopup, setOpenPopup } = props;

  return (
    openPopup ? <div ref={rootRef}>
       <Dialog open={openPopup}
       maxWidth="lg"
       fullWidth
       withFullScreen
        onClose={() => {
            setOpenPopup(false);
        }}
        title="AI Analysis for pod"
       >
        <DialogContent>
        {children}
        </DialogContent>
       </Dialog>
    </div> : null
  );
}