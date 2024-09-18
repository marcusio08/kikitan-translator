import * as React from "react"

import { Select, MenuItem, Button } from "@mui/material"

import {
    X as XIcon,
    GitHub as GitHubIcon,
    SwapHoriz as SwapHorizIcon,
    Favorite as FavoriteIcon,
    KeyboardVoice as KeyboardVoiceIcon
} from '@mui/icons-material';

import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-shell'

import { calculateMinWaitTime, Lang, langSource, langTo } from "../util/constants"
import { default as translateGT } from '../translators/google_translate';
import { Config } from "../util/config";
import { Recognizer } from "../recognizers/recognizer";
import { WebSpeech } from "../recognizers/WebSpeech";

type KikitanProps = {
    sr_on: boolean;
    ovr: boolean;
    vrc: boolean;
    config: Config;
    setConfig: (config: Config) => void;
    ws: WebSocket | null;
    lang: Lang;
}

let sr: Recognizer | null = null;

let detectionQueue: string[] = []
let lock = false

export default function Kikitan({ sr_on, ovr, vrc, config, setConfig, ws, lang }: KikitanProps) {
    const [detecting, setDetecting] = React.useState(true)

    const [detection, setDetection] = React.useState("")
    const [translated, setTranslated] = React.useState("")
    
    const [defaultMicrophone, setDefaultMicrophone] = React.useState("")
    const [lastDefaultMicrophone, setLastDefaultMicrophone] = React.useState("")

    const [sourceLanguage, setSourceLanguage] = React.useState(config.source_language)
    const [targetLanguage, setTargetLanguage] = React.useState(config.target_language)

    React.useEffect(() => {
        setInterval(() => {
            navigator.mediaDevices.enumerateDevices()
            .then(function (devices) {
                let def = devices.filter((device) => device.kind == "audioinput")[0].label
                def = def.split("(")[1].split(")")[0]

                setDefaultMicrophone(def)
            }).catch(function (err) {
                console.log(err.name + ": " + err.message);
            });
        }, 1000)

        setInterval(async () => {
            if (detectionQueue.length == 0 || lock) return;

            const val = detectionQueue[0]
            detectionQueue = detectionQueue.slice(1)

            lock = true

            invoke("send_typing", { address: config.vrchat_settings.osc_address, port: `${config.vrchat_settings.osc_port}` })
            let count = 3;

            while (count > 0) {
                switch (config.translator) {
                    case 0:
                        try {
                            let text = await translateGT(val, langSource[sourceLanguage].code, langTo[targetLanguage].code)
    
                            setTranslated(text)
    
                            invoke("send_message", { address: config.vrchat_settings.osc_address, port: `${config.vrchat_settings.osc_port}`, msg: config.vrchat_settings.translation_first ? `${text} (${val})` : `${val} (${text})` })
                            await new Promise(r => setTimeout(r, calculateMinWaitTime(text, config.vrchat_settings.chatbox_update_speed)));

                            count = 0
                        } catch (e) {
                            console.log(e)
    
                            count--
                        }
    
                        break;
                }
            }

            lock = false
        }, 100)
    }, [])

    React.useEffect(() => {
        if (defaultMicrophone == "") return;
        console.log("Default microphone is not empty")

        if (lastDefaultMicrophone == "") {
            setLastDefaultMicrophone(defaultMicrophone)

            return;
        }

        console.log("Last default microphone is not empty")

        if (lastDefaultMicrophone == defaultMicrophone) return;

        window.location.reload()
    }, [defaultMicrophone])

    React.useEffect(() => {
        if (sr == null) {
            sr = new WebSpeech(langSource[sourceLanguage].code)

            sr.onResult((result: string, isFinal: boolean) => {
                if (!sr_on) return;
                if (config.mode == 1 || config.vrchat_settings.send_typing_while_talking) invoke("send_typing", { address: config.vrchat_settings.osc_address, port: `${config.vrchat_settings.osc_port}` })
    
                setDetection(result)
                setDetecting(!isFinal)
            })
        }
        
        if (sr_on) {
            sr.start()
        } else {
            sr.stop()
        }
    }, [sr_on])

    React.useEffect(() => {
        if (!detecting && detection.length != 0) {
            if (ovr) {
                if (ws != null) ws.send(`send-${langSource[sourceLanguage].code == "ja" ? detection.replace("？/g", "") : detection}`)

                return;
            }

            if (vrc) {
                if (config.mode == 0) {
                    detectionQueue = [...detectionQueue, (langSource[sourceLanguage].code == "ja" && config.language_settings.japanese_omit_questionmark) ? detection.replace("？/g", "") : detection]

                    return
                }

                invoke("send_message", { address: config.vrchat_settings.osc_address, port: `${config.vrchat_settings.osc_port}`, msg: (langSource[sourceLanguage].code == "ja" && config.language_settings.japanese_omit_questionmark) ? detection.replace("？/g", "") : detection })
            }
        }
    }, [detecting, detection])

    return <>
        <div className="flex align-middle">
            <div>
                <div className={`mr-16 w-96 h-48 outline outline-2 outline-slate-400 rounded-md font-bold text-center ${detecting ? "text-slate-700 italic" : "text-black"}`}>
                    <p className="align-middle">{detection}</p>
                </div>
                <div className="flex">
                    <Select className="mt-4 ml-auto h-14" value={sourceLanguage} onChange={(e) => {
                        const langIndex = parseInt(e.target.value.toString());
                        if (sr) {
                            sr.set_lang(langSource[langIndex].code)
                        }

                        setSourceLanguage(langIndex)
                        setConfig({ ...config, source_language: langIndex })
                    }}>
                        {langSource.map((element, i) => {
                            return <MenuItem key={element.code} value={i}>{element.name[lang]}</MenuItem>
                        })}
                    </Select>
                    <div className="mt-7">
                        <Button onClick={() => {
                            let old_t = (sourceLanguage == 0) || (sourceLanguage == 1) ? 0 : sourceLanguage
                            let old_s = targetLanguage

                            if (sr) {
                                sr.set_lang(langSource[old_s].code)
                            }

                            setTargetLanguage(old_t)
                            setSourceLanguage(old_s)

                            setConfig({ ...config, source_language: old_s, target_language: old_t })
                        }}>
                            <SwapHorizIcon />
                        </Button>
                    </div>
                </div>
            </div>

            <div>
                <div className="w-96 h-48 outline outline-2 outline-slate-400 rounded-md text-black font-bold text-center">
                    <p className="align-middle">{translated}</p>
                </div>
                <div>
                    <Select className="mt-4" value={targetLanguage} onChange={(e) => {
                        const langIndex = parseInt(e.target.value.toString());
                        setTargetLanguage(langIndex)
                        setConfig({ ...config, target_language: langIndex })
                    }}>
                        {(() => {
                            let m = langTo.map((element, i) => {
                                return {
                                    e: element,
                                    i
                                }
                            })

                            m = m.filter((element, i) => {
                                return m.findIndex((e) => e.e.code == element.e.code) == i
                            })

                            return m.map((element) => {
                                return <MenuItem key={element.e.code} value={element.i}>{element.e.name[lang]}</MenuItem>
                            })

                        })()}
                    </Select>
                </div>
            </div>
        </div>
        <div className="align-middle mt-2">
            <KeyboardVoiceIcon fontSize="small" /><a className=" text-blue-700"  href="" onClick={(e) => {
                e.preventDefault()

                invoke("show_windows_audio_settings")
            }}>{defaultMicrophone}</a>
            <div className="mt-8 flex space-x-2">
                <Button variant="contained" size="small" className="h-8" onClick={() => { open("https://twitter.com/marquina_osu") }}><XIcon fontSize="small" /></Button>
                <Button variant="contained" size="small" className="h-8" onClick={() => { open("https://buymeacoffee.com/sergiomarquina") }}><FavoriteIcon fontSize="small" /></Button>
                <Button variant="contained" size="small" className="h-8" onClick={() => { open("https://github.com/YusufOzmen01/kikitan-translator") }}><GitHubIcon fontSize="small" /></Button>
            </div>
        </div>
    </>
}