import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
export const ConfirmDialog = ({ details, message, onConfirm, title }) => {
    const options = [
        { label: 'Yes, approve', value: true },
        { label: 'No, deny', value: false },
    ];
    const handleSelect = (item) => {
        onConfirm(item.value);
    };
    return (_jsxs(Box, { borderColor: "yellow", borderStyle: "round", flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: "yellow", children: title }) }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { children: message }) }), details && (_jsx(Box, { borderColor: "gray", borderStyle: "single", marginBottom: 1, padding: 1, children: _jsx(Text, { dimColor: true, children: details }) })), _jsx(SelectInput, { items: options, onSelect: handleSelect })] }));
};
export const FileEditPreview = ({ filePath, onConfirm, replacementCode, targetCode, }) => {
    const options = [
        { label: 'Apply patch', value: true },
        { label: 'Deny', value: false },
    ];
    const handleSelect = (item) => {
        onConfirm(item.value);
    };
    return (_jsxs(Box, { borderColor: "yellow", borderStyle: "double", flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: "yellow", children: "\uD83D\uDD27 PROPOSED FILE EDIT" }) }), _jsxs(Box, { marginBottom: 1, children: [_jsx(Text, { color: "cyan", children: "File: " }), _jsx(Text, { children: filePath })] }), _jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { bold: true, color: "red", children: "\u2500\u2500\u2500 REMOVE \u2500\u2500\u2500" }), targetCode.split('\n').map((line, idx) => (_jsxs(Text, { color: "red", children: ["- ", line] }, `remove-${idx}`)))] }), _jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { bold: true, color: "green", children: "+++ ADD +++" }), replacementCode.split('\n').map((line, idx) => (_jsxs(Text, { color: "green", children: ["+ ", line] }, `add-${idx}`)))] }), _jsx(Box, { marginBottom: 1, children: _jsxs(Text, { bold: true, children: ["Apply this patch to ", filePath, "?"] }) }), _jsx(SelectInput, { items: options, onSelect: handleSelect })] }));
};
export const CommandPreview = ({ command, onConfirm }) => {
    const options = [
        { label: 'Execute', value: true },
        { label: 'Deny', value: false },
    ];
    const handleSelect = (item) => {
        onConfirm(item.value);
    };
    return (_jsxs(Box, { borderColor: "yellow", borderStyle: "round", flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: "yellow", children: "\u26A1 PROPOSED COMMAND EXECUTION" }) }), _jsx(Box, { borderColor: "magenta", borderStyle: "single", marginBottom: 1, padding: 1, children: _jsxs(Text, { color: "magenta", children: ["$ ", command] }) }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, children: "Execute this command?" }) }), _jsx(SelectInput, { items: options, onSelect: handleSelect })] }));
};
