'use client';

import { useEffect, useState } from 'react';

interface GooglePickerProps {
    onFileSelected: (file: { id: string; name: string }) => void;
    clientId: string;
    developerKey: string;
}

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

export default function GooglePicker({ onFileSelected, clientId, developerKey }: GooglePickerProps) {
    const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
    const [isConfigured, setIsConfigured] = useState(true);

    useEffect(() => {
        if (!clientId || !developerKey) {
            setIsConfigured(false);
            return;
        }

        const loadScript = () => {
            if (window.gapi) {
                window.gapi.load('picker', { callback: () => setPickerApiLoaded(true) });
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                window.gapi.load('picker', { callback: () => setPickerApiLoaded(true) });
            };
            document.body.appendChild(script);
        };
        loadScript();
    }, [clientId, developerKey]);

    const createPicker = async () => {
        if (!pickerApiLoaded) return;

        try {
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/drive.readonly',
                callback: (response: any) => {
                    if (response.error !== undefined) {
                        console.error('OAuth Error:', response);
                        return;
                    }

                    const view = new window.google.picker.DocsView(window.google.picker.ViewId.PDFs)
                        .setMode(window.google.picker.DocsViewMode.LIST)
                        .setIncludeFolders(true)
                        .setEnableDrives(true);

                    const picker = new window.google.picker.PickerBuilder()
                        .addView(view)
                        .setOAuthToken(response.access_token)
                        .setDeveloperKey(developerKey)
                        .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
                        .enableFeature(window.google.picker.Feature.SUPPORT_TEAM_DRIVES)
                        .setCallback((data: any) => {
                            if (data.action === window.google.picker.Action.PICKED) {
                                const file = data.docs[0];
                                onFileSelected({ id: file.id, name: file.name });
                            }
                        })
                        .build();
                    picker.setVisible(true);
                },
            });
            tokenClient.requestAccessToken();
        } catch (error) {
            console.error('Picker initialization error:', error);
            alert('Error al abrir el selector de Google Drive. Verifica la configuración de la consola de Google.');
        }
    };

    if (!isConfigured) {
        return (
            <div className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg text-center uppercase">
                Faltan variables de entorno (CLIENT_ID / API_KEY)
            </div>
        );
    }

    return (
        <button
            onClick={(e) => { e.preventDefault(); createPicker(); }}
            disabled={!pickerApiLoaded}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black text-sm transition-all shadow-lg ${pickerApiLoaded
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
        >
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-5 h-5" alt="Drive" />
            {pickerApiLoaded ? 'SELECCIONAR MEMORIA' : 'CARGANDO SELECTOR...'}
        </button>
    );
}
