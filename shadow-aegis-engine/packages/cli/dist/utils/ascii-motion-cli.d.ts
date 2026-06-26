import React from 'react';
type PlaybackAPI = {
    pause: () => void;
    play: () => void;
    restart: () => void;
};
type AsciiMotionCliProps = {
    autoPlay?: boolean;
    hasDarkBackground?: boolean;
    loop?: boolean;
    onReady?: (api: PlaybackAPI) => void;
};
export declare const AsciiMotionCli: React.FC<AsciiMotionCliProps>;
export default AsciiMotionCli;
