declare const App: ({ ciEnabled, diffEnabled, expertUnsafe, failOn, forceReconfigure, mode, since, }: {
    ciEnabled?: boolean;
    diffEnabled?: boolean;
    expertUnsafe: boolean;
    failOn?: string;
    forceReconfigure: boolean;
    mode?: string;
    since?: string;
}) => import("react/jsx-runtime").JSX.Element;
export default App;
