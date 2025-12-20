var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { useState, useEffect, useRef, useCallback } from 'react';
var DEFAULT_OPTIONS = {
    lang: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 1
};
export function useVoiceToText(options) {
    if (options === void 0) { options = {}; }
    var _a = useState(false), isListening = _a[0], setIsListening = _a[1];
    var _b = useState(''), transcript = _b[0], setTranscript = _b[1];
    var _c = useState(''), interimTranscript = _c[0], setInterimTranscript = _c[1];
    var _d = useState(false), isSupported = _d[0], setIsSupported = _d[1];
    var _e = useState(null), error = _e[0], setError = _e[1];
    var recognitionRef = useRef(null);
    var finalTranscriptRef = useRef('');
    useEffect(function () {
        // Check if speech recognition is supported
        var SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
            setIsSupported(true);
            recognitionRef.current = new SpeechRecognitionAPI();
            var recognition = recognitionRef.current;
            var mergedOptions = __assign(__assign({}, DEFAULT_OPTIONS), options);
            // Configure recognition
            recognition.continuous = mergedOptions.continuous;
            recognition.interimResults = mergedOptions.interimResults;
            recognition.lang = mergedOptions.lang;
            recognition.maxAlternatives = mergedOptions.maxAlternatives;
            // Event handlers
            recognition.onstart = function () {
                setIsListening(true);
                setError(null);
                console.log('[Voice] Started listening');
            };
            recognition.onend = function () {
                setIsListening(false);
                console.log('[Voice] Stopped listening');
            };
            recognition.onerror = function (event) {
                var errorMessage = 'Speech recognition error';
                switch (event.error) {
                    case 'no-speech':
                        errorMessage = 'No speech detected. Please try again.';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Audio capture failed. Check your microphone.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Microphone access denied. Please enable permissions.';
                        break;
                    case 'network':
                        errorMessage = 'Network error. Check your connection.';
                        break;
                    case 'service-not-allowed':
                        errorMessage = 'Speech recognition service not allowed.';
                        break;
                    default:
                        errorMessage = "Speech recognition error: ".concat(event.error);
                }
                setError(errorMessage);
                setIsListening(false);
                console.error('[Voice] Error:', event.error);
            };
            recognition.onresult = function (event) {
                var finalTranscript = '';
                var interimTranscript = '';
                // Process all results
                for (var i = event.resultIndex; i < event.results.length; i++) {
                    var result = event.results[i];
                    var transcript_1 = result[0].transcript;
                    if (result.isFinal) {
                        finalTranscript += transcript_1;
                    }
                    else {
                        interimTranscript += transcript_1;
                    }
                }
                // Update final transcript
                if (finalTranscript) {
                    finalTranscriptRef.current += finalTranscript;
                    setTranscript(finalTranscriptRef.current);
                }
                // Update interim transcript
                setInterimTranscript(interimTranscript);
                console.log('[Voice] Result:', { final: finalTranscript, interim: interimTranscript });
            };
        }
        else {
            setIsSupported(false);
            setError('Speech recognition is not supported in this browser');
        }
        // Cleanup
        return function () {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [options]);
    var startListening = useCallback(function () {
        if (!recognitionRef.current || isListening)
            return;
        try {
            setError(null);
            recognitionRef.current.start();
        }
        catch (err) {
            var errorMessage = err instanceof Error ? err.message : 'Failed to start speech recognition';
            setError(errorMessage);
            console.error('[Voice] Failed to start:', err);
        }
    }, [isListening]);
    var stopListening = useCallback(function () {
        if (!recognitionRef.current || !isListening)
            return;
        try {
            recognitionRef.current.stop();
        }
        catch (err) {
            console.error('[Voice] Failed to stop:', err);
        }
    }, [isListening]);
    var resetTranscript = useCallback(function () {
        setTranscript('');
        setInterimTranscript('');
        finalTranscriptRef.current = '';
    }, []);
    return {
        isListening: isListening,
        transcript: transcript,
        interimTranscript: interimTranscript,
        isSupported: isSupported,
        error: error,
        startListening: startListening,
        stopListening: stopListening,
        resetTranscript: resetTranscript
    };
}
