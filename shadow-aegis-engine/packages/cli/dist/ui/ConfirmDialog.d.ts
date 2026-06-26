import React from 'react';
interface ConfirmDialogProps {
    details?: string;
    message: string;
    onConfirm: (confirmed: boolean) => void;
    title: string;
}
export declare const ConfirmDialog: React.FC<ConfirmDialogProps>;
interface FileEditPreviewProps {
    filePath: string;
    onConfirm: (confirmed: boolean) => void;
    replacementCode: string;
    targetCode: string;
}
export declare const FileEditPreview: React.FC<FileEditPreviewProps>;
interface CommandPreviewProps {
    command: string;
    onConfirm: (confirmed: boolean) => void;
}
export declare const CommandPreview: React.FC<CommandPreviewProps>;
export {};
