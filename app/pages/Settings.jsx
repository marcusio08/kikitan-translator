import * as React from "react"

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { IconButton, FormControlLabel, FormGroup, Checkbox, TextField, Select, MenuItem } from "@mui/material";

import {
    Close,
    History
} from '@mui/icons-material';
import { DEFAULT_CONFIG, speed_presets } from "../util/config";

import { localization } from "../util/localization";

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function Settings({ closeCallback, config, setConfig, lang }) {
    const [page, setPage] = React.useState(0);

    const handleChange = (event, newValue) => {
        setPage(newValue);
    };

    return <>
        <Box sx={{ width: '100%' }}>
            <Box className="flex" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <IconButton className="ml-2 mr-2" onClick={() => { closeCallback() }}>
                    <Close />
                </IconButton>
                <Tabs value={page} onChange={handleChange}>
                    <Tab label={localization.language_settings[lang]} {...a11yProps(0)} />
                    <Tab label={localization.vrchat_settings[lang]} {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabPanel className="flex" value={page} index={0}>
                <FormGroup>
                    <FormControlLabel control={<Checkbox checked={config.language_settings.japanese_omit_questionmark} onChange={(e) => {
                        setConfig({
                            ...config,
                            language_settings: {
                                ...config.language_settings,
                                japanese_omit_questionmark: e.target.checked
                            }
                        })
                    }} />} label={localization.omit_questionmark[lang]} />
                </FormGroup>
            </CustomTabPanel>
            <CustomTabPanel className="flex" value={page} index={1}>
                <FormGroup>
                    <FormControlLabel control={<Checkbox checked={config.vrchat_settings.translation_first} onChange={(e) => {
                        setConfig({
                            ...config,
                            vrchat_settings: {
                                ...config.vrchat_settings,
                                translation_first: e.target.checked
                            }
                        })
                    }} />} label={localization.translation_first[lang]} />
                    <FormControlLabel control={<Checkbox checked={config.vrchat_settings.send_typing_while_talking} onChange={(e) => {
                        setConfig({
                            ...config,
                            vrchat_settings: {
                                ...config.vrchat_settings,
                                send_typing_while_talking: e.target.checked
                            }
                        })
                    }} />} label={localization.send_typing_while_talking[lang]} />
                    {/* <FormControlLabel control={<Checkbox checked={config.vrchat_settings.dont_send_when_muted} onChange={(e) => {
                        setConfig({
                            ...config,
                            vrchat_settings: {
                                ...config.vrchat_settings,
                                dont_send_when_muted: e.target.checked
                            }
                        })
                    }} />} label={localization.dont_send_when_muted[lang]} /> */}
                    <div className="flex">
                        <TextField className="mt-2 w-48" value={config.vrchat_settings.osc_address} id="outlined-basic" label={localization.osc_address[lang]} variant="outlined" onChange={(e) => {
                            setConfig({
                                ...config,
                                vrchat_settings: {
                                    ...config.vrchat_settings,
                                    osc_address: e.target.value
                                }
                            })
                        }} />
                        <TextField className="ml-2 mt-2 w-48" value={config.vrchat_settings.osc_port} id="outlined-basic" label={localization.osc_port[lang]} variant="outlined" type="number" onChange={(e) => {
                            setConfig({
                                ...config,
                                vrchat_settings: {
                                    ...config.vrchat_settings,
                                    osc_port: e.target.value
                                }
                            })
                        }} />
                        <IconButton className="ml-2" disabled={
                            config.vrchat_settings.osc_address == DEFAULT_CONFIG.vrchat_settings.osc_address &&
                            config.vrchat_settings.osc_port == DEFAULT_CONFIG.vrchat_settings.osc_port}
                            onClick={() => {
                                setConfig({
                                    ...config,
                                    vrchat_settings: {
                                        ...config.vrchat_settings,
                                        osc_address: DEFAULT_CONFIG.vrchat_settings.osc_address,
                                        osc_port: DEFAULT_CONFIG.vrchat_settings.osc_port
                                    }
                                })
                            }}>
                            <History />
                        </IconButton>
                    </div>
                    <p className="mt-2">{localization.chatbox_update_speed[lang]}</p>
                    <Select className="mt-0 w-48" value={config.vrchat_settings.chatbox_update_speed} onChange={(e) => {
                        setConfig({
                            ...config,
                            vrchat_settings: {
                                ...config.vrchat_settings,
                                chatbox_update_speed: e.target.value
                            }
                        })
                    }} >
                        <MenuItem value={speed_presets.slow}>{localization.slow[lang]}</MenuItem>
                        <MenuItem value={speed_presets.medium}>{localization.medium[lang]}</MenuItem>
                        <MenuItem value={speed_presets.fast}>{localization.fast[lang]}</MenuItem>
                    </Select>
                </FormGroup>
            </CustomTabPanel>
        </Box>
    </>
}