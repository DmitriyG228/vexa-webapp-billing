"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { AlertCircle, Check, Copy, Eye, EyeOff, Key, Loader2, CreditCard, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageContainer, Section } from "@/components/ui/page-container"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface TranscriptionUser {
  user_id: number;
  email: string;
  name?: string | null;
  api_token: string;
  token_created_at: string;
  token_last_used_at: string | null;
  balance_minutes: number;
  is_active: boolean;
}

export default function TranscriptionPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [userData, setUserData] = useState<TranscriptionUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !session?.user?.email) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/transcription/api-key');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || 'Failed to fetch transcription data');
      }

      const data = await response.json();
      setUserData({
        user_id: data.user_id,
        email: data.email,
        name: data.name,
        api_token: data.api_token,
        token_created_at: data.token_created_at,
        token_last_used_at: data.token_last_used_at,
        balance_minutes: data.balance_minutes,
        is_active: data.is_active,
      });
    } catch (err) {
      console.error('Error fetching transcription data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [sessionStatus, session]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchUserData();
    }
  }, [sessionStatus, fetchUserData]);


  const handlePurchase = async () => {
    if (!userData?.api_token) {
      toast({
        title: "Error",
        description: "Please register first to get your API key",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(true);
    try {
      const response = await fetch('https://transcription.vexa.ai/purchase', {
        method: 'POST',
        headers: {
          'X-API-Key': userData.api_token,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create payment link');
      }

      const data = await response.json();
      if (data.payment_url) {
        window.open(data.payment_url, '_blank');
        toast({
          title: "Payment link opened",
          description: "Complete your purchase in the new window. Your balance will update automatically.",
        });
      }
    } catch (err) {
      console.error('Error creating payment link:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create payment link',
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  const copyToClipboard = () => {
    if (!userData?.api_token) return;
    navigator.clipboard.writeText(userData.api_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "API key copied",
      description: "The transcription API key has been copied to your clipboard.",
      duration: 3000,
    });
  };

  if (sessionStatus === "loading") {
    return (
      <PageContainer>
        <Section>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </Section>
      </PageContainer>
    );
  }

  if (sessionStatus !== "authenticated") {
    return (
      <PageContainer>
        <Section>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground text-center mb-4">
                Please sign in to access the transcription service.
              </p>
            </CardContent>
          </Card>
        </Section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Section>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Transcription Service</h1>
          <p className="text-muted-foreground mt-2">
            Get your transcription API key and manage minutes. Your account is automatically set up using your existing authentication.
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
              <span className="text-muted-foreground">Loading...</span>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-6">
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <strong>Error:</strong> {error}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={fetchUserData}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : userData ? (
          // User is registered - show API key and balance
          <div className="space-y-6">
            {/* API Key Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Your API Key
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Use this key to authenticate transcription requests
                    </CardDescription>
                  </div>
                  {userData?.is_active && (
                    <Badge variant="default" className="bg-green-500">
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showKey ? "text" : "password"}
                        value={userData?.api_token || ''}
                        readOnly
                        className="pr-10 font-mono text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-1"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showKey ? "Hide key" : "Show key"}</span>
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="sr-only">Copy key</span>
                    </Button>
                  </div>
                </div>
                <div className="rounded-md bg-muted p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="font-medium text-lg">{userData?.balance_minutes?.toFixed(2) || '0.00'} minutes</span>
                  </div>
                </div>
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5 text-blue-500" />
                    <div className="text-blue-800 dark:text-blue-200">
                      <strong>Usage:</strong> Include this key in the <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded">X-API-Key</code> header when calling <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded">https://transcription.vexa.ai/v1/audio/transcriptions</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Minutes Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Purchase Minutes
                </CardTitle>
                <CardDescription>
                  Buy additional transcription minutes to continue using the service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Balance</span>
                    <span className="text-2xl font-bold">{userData?.balance_minutes?.toFixed(2) || '0.00'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">minutes remaining</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Pricing:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>$0.0015 per minute</li>
                    <li>Minimum purchase: $5.00 (~3,333 minutes)</li>
                    <li>Pay-as-you-go pricing</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full"
                  size="lg"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating payment link...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Purchase Minutes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Account Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm font-medium">{userData?.email || ''}</span>
                </div>
                {userData?.name && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="text-sm font-medium">{userData.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User ID:</span>
                  <span className="text-sm font-medium">{userData?.user_id || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Token Created:</span>
                  <span className="text-sm font-medium">
                    {userData?.token_created_at ? new Date(userData.token_created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
              <span className="text-muted-foreground">Setting up your account...</span>
            </CardContent>
          </Card>
        )}

        <Toaster />
      </Section>
    </PageContainer>
  );
}

