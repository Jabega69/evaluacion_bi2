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

    useEffect(() => {
        const loadScript = () => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                window.gapi.load('picker', { callback: () => setPickerApiLoaded(true) });
            };
            document.body.appendChild(script);
        };
        loadScript();
    }, []);

    const createPicker = async () => {
        if (!pickerApiLoaded) return;

        // Nota: Google Picker requiere un token de acceso fresco.
        // En una implementación real, dispararíamos el flujo de OAuth aquí o usaríamos uno ya obtenido.
        // Para simplificar esta demo, asumimos que el administrador se ha logueado recientemente
        // y usaremos el flujo de la ventana emergente de Google para obtener un token de sesión rápido
        // solo para el picker.

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

                // Vista de compartidos con el usuario
                const sharedView = new window.google.picker.DocsView(window.google.picker.ViewId.PDFs)
                    .setOwnedByMe(false)
                    .setMode(window.google.picker.DocsViewMode.LIST)
                    .setIncludeFolders(true)
                    .setEnableDrives(true);

                const picker = new window.google.picker.PickerBuilder()
                    .addView(view)
                    .addView(sharedView)
                    .addView(window.google.picker.ViewId.RECENTLY_PICKED)
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
    };

    return (
        <button
            onClick={(e) => { e.preventDefault(); createPicker(); }}
            className="group flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
        >
            <div className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-4 h-4" alt="Drive" />
            </div>
            SELECCIONAR MEMORIA
        </button>
    );
}
