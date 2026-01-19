'use client';

import { useEffect, useState } from 'react';

interface GooglePickerProps {
    onFileSelected: (file: { id: string; name: string }) => void;
    clientId: string;
    developerKey: string;
    isOpen: boolean;
    onClose: () => void;
}

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

let scriptLoading = false;
let scriptLoaded = false;

export default function GooglePicker({ onFileSelected, clientId, developerKey, isOpen, onClose }: GooglePickerProps) {
    const [pickerApiLoaded, setPickerApiLoaded] = useState(scriptLoaded);

    useEffect(() => {
        if (scriptLoaded) {
            setPickerApiLoaded(true);
            return;
        }
        if (scriptLoading) return;

        const loadScript = () => {
            scriptLoading = true;
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                window.gapi.load('picker', {
                    callback: () => {
                        scriptLoaded = true;
                        setPickerApiLoaded(true);
                    }
                });
            };
            document.body.appendChild(script);
        };
        loadScript();
    }, []);

    useEffect(() => {
        if (isOpen && pickerApiLoaded) {
            createPicker();
        }
    }, [isOpen, pickerApiLoaded]);

    const createPicker = async () => {
        if (!clientId || !developerKey) {
            console.error('Google Config Missing');
            onClose();
            return;
        }

        try {
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/drive.readonly',
                callback: (response: any) => {
                    if (response.error !== undefined) {
                        console.error('OAuth Error:', response);
                        onClose();
                        return;
                    }

                    // Usamos una vista única pero con el panel de navegación habilitado
                    // Esto permite al usuario ver "Mi Unidad", "Compartido conmigo" y "Unidades compartidas"
                    // en el menú de la izquierda, igual que en Drive.
                    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
                        .setMimeTypes('application/pdf')
                        .setMode(window.google.picker.DocsViewMode.LIST)
                        .setIncludeFolders(true)
                        .setEnableDrives(true);

                    const picker = new window.google.picker.PickerBuilder()
                        .addView(view)
                        .addView(window.google.picker.ViewId.RECENTLY_PICKED)
                        .setOAuthToken(response.access_token)
                        .setDeveloperKey(developerKey)
                        .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
                        .enableFeature(window.google.picker.Feature.SUPPORT_TEAM_DRIVES)
                        // IMPORTANTE: NO añadir NAV_HIDDEN para que se vea el menú lateral
                        .setSize(1050, 600) // Hacemos la ventana más grande para que quepa el menú
                        .setCallback((data: any) => {
                            if (data.action === window.google.picker.Action.PICKED) {
                                const file = data.docs[0];
                                onFileSelected({ id: file.id, name: file.name });
                                onClose();
                            } else if (data.action === window.google.picker.Action.CANCEL) {
                                onClose();
                            }
                        })
                        .build();
                    picker.setVisible(true);
                },
            });
            tokenClient.requestAccessToken();
        } catch (err) {
            console.error('Picker error:', err);
            onClose();
        }
    };

    return null;
}
