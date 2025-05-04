"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { generateMotivationResponse } from '@/ai/flows/generate-motivation-response';
import { useToast } from "@/hooks/use-toast";
import { LoadingIndicator } from './LoadingIndicator';
import { cn } from '@/lib/utils';

// Placeholder for SpeechRecognition and SpeechSynthesisUtterance if window is not defined (SSR)
const BrowserSpeechRecognition =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;
const BrowserSpeechSynthesisUtterance =
  typeof window !== 'undefined' ? window.SpeechSynthesisUtterance : null;

export function ChatInterface() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null); // Using 'any' for broader compatibility
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!BrowserSpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = new BrowserSpeechRecognition();
    recognition.continuous = false; // Stop listening after a pause
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => { // Using 'any' for broader compatibility
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript || interimTranscript); // Display interim results

       // Reset timeout on new speech input
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Set timeout to stop listening after a pause (e.g., 3 seconds)
      timeoutRef.current = setTimeout(() => {
         if (isListening) {
           stopListening();
           if(finalTranscript || interimTranscript) {
             handleSend(finalTranscript || interimTranscript);
           }
         }
      }, 3000); // 3 seconds pause
    };

    recognition.onerror = (event: any) => { // Using 'any' for broader compatibility
      console.error('Speech recognition error:', event.error);
      let errorMessage = 'Speech recognition error.';
      if (event.error === 'no-speech') {
        errorMessage = 'No speech detected. Please try again.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Audio capture failed. Check microphone permissions.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Microphone access denied. Please allow microphone access in browser settings.';
      }
       toast({
           title: "Error",
           description: errorMessage,
           variant: "destructive",
       });
      setIsListening(false);
    };

    recognition.onend = () => {
       // Don't automatically set isListening to false here if we expect it to restart
       // Only set to false if stopped manually or on error
       if (timeoutRef.current) {
         clearTimeout(timeoutRef.current); // Clear timeout when recognition ends naturally
       }
    };

    recognitionRef.current = recognition;

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech synthesis
      }
       if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
       }
    };
  }, [toast]); // Added toast dependency


  // Function to start listening
  const startListening = () => {
    if (!recognitionRef.current) {
         toast({ title: "Error", description: "Speech recognition not available.", variant: "destructive" });
         return;
    }
    if (isListening) return;

    setTranscript('');
    setResponse(''); // Clear previous response
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (error) {
        console.error("Error starting recognition:", error);
        toast({ title: "Error", description: "Could not start microphone.", variant: "destructive" });
        setIsListening(false);
    }
  };

  // Function to stop listening
  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
     if (timeoutRef.current) {
       clearTimeout(timeoutRef.current); // Clear any pending timeout
       timeoutRef.current = null;
     }
    recognitionRef.current.stop();
    setIsListening(false);
  };


  // Function to speak the response
  const speakResponse = (text: string) => {
    if (!BrowserSpeechSynthesisUtterance || !window.speechSynthesis || isMuted || !text) {
        setIsSpeaking(false);
        return;
    }

    // Cancel any previous speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new BrowserSpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
       toast({ title: "Error", description: "Could not play audio response.", variant: "destructive" });
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

    // Function to stop speaking
    const stopSpeaking = () => {
        if (!window.speechSynthesis || !isSpeaking) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

  // Function to send transcript to AI
  const handleSend = async (textToSend: string) => {
     if (!textToSend.trim()) return; // Don't send empty messages
     setIsLoading(true);
     setResponse(''); // Clear previous response visually
     stopListening(); // Ensure listening stops before sending

    try {
      const result = await generateMotivationResponse({ query: textToSend });
      setResponse(result.response);
      if (!isMuted) {
        speakResponse(result.response);
      }
    } catch (error) {
      console.error('Error generating motivation response:', error);
       toast({
           title: "AI Error",
           description: "Failed to get a response from the AI. Please try again.",
           variant: "destructive",
       });
      setResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
       if (transcript.trim()) {
           handleSend(transcript); // Send current transcript if stopped manually
       }
    } else {
      startListening();
    }
  };

  const handleMuteToggle = () => {
      const nextMutedState = !isMuted;
      setIsMuted(nextMutedState);
      if (nextMutedState && isSpeaking) {
          stopSpeaking();
      }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/10 p-4">
       <h1 className="text-4xl font-bold text-primary mb-8">nextlearn Ai</h1>
       <Card className="w-full max-w-lg shadow-xl rounded-lg">
          <CardHeader className="text-center">
             <CardTitle className="text-2xl font-semibold">How can I motivate you today?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 min-h-[200px] flex flex-col justify-center">
              <div className={cn(
                   "p-4 border rounded-md min-h-[60px] text-muted-foreground italic",
                   transcript && "text-foreground not-italic" // Change style when there's transcript
                 )}>
                   {transcript || 'Speak your request...'}
              </div>

              <div className="p-4 border border-primary/30 bg-primary/5 rounded-md min-h-[100px]">
                 {isLoading ? (
                   <LoadingIndicator />
                 ) : (
                   <p className={cn("text-secondary-foreground", response ? "text-foreground" : "text-muted-foreground")}>
                     {response || 'Waiting for your request...'}
                   </p>
                 )}
              </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4">
             <Button
               onClick={handleMicClick}
               size="lg"
               className={cn(
                 "rounded-full w-20 h-20 transition-all duration-300 ease-in-out shadow-lg hover:scale-105",
                 isListening ? "bg-destructive hover:bg-destructive/90 animate-pulse" : "bg-primary hover:bg-primary/90",
                 "active:scale-95"
               )}
               aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
             >
               {isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
             </Button>
             <div className="flex items-center justify-center gap-4 mt-2">
                 <Button
                     variant="ghost"
                     size="icon"
                     onClick={handleMuteToggle}
                     className="text-muted-foreground hover:text-foreground"
                     aria-label={isMuted ? 'Unmute Speaker' : 'Mute Speaker'}
                 >
                     {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                 </Button>
                 {/* Placeholder for future Settings button */}
                 {/* <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                     <Settings className="h-5 w-5" />
                 </Button> */}
             </div>
          </CardFooter>
       </Card>
       <p className="text-sm text-muted-foreground mt-8">
           Click the microphone to start speaking. Pausing will automatically send your request.
       </p>
    </div>
  );
}
