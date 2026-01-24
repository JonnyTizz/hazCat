import React, { useCallback, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Button,
  Card,
  Flex,
  Heading,
  Text,
  Theme,
  Box,
  Inset,
  Switch,
  Dialog,
} from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type HazCatResult = {
  hazCat: boolean;
  message: string;
};

type Status = 'idle' | 'loading' | 'success' | 'danger';

const getImageTypeLabel = (mime: string | null) => {
  switch (mime) {
    case 'image/jpeg':
      return 'jpeg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return '';
  }
};

const parseDataUrl = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    return null;
  }
  return { mime: match[1], base64: match[2] };
};

const triggerSadRain = () => {
  const bursts = [0.2, 0.5, 0.8];
  bursts.forEach((x, index) => {
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 90,
        spread: 40,
        startVelocity: 35,
        gravity: 1.2,
        scalar: 0.8,
        colors: ['#5dade2', '#85c1e9', '#aed6f1'],
        origin: { x, y: 0 },
      });
    }, index * 120);
  });
};

const HazCatApp: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string | null>(null);
  const [message, setMessage] = useState<string>(
    'Pick an image and ask hazcat?',
  );
  const [status, setStatus] = useState<Status>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState<HazCatResult | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = Boolean(imageBase64 && imageType && status !== 'loading');

  const cardVariant = useMemo(() => {
    switch (status) {
      case 'success':
        return 'green';
      case 'danger':
        return 'red';
      default:
        return 'gray';
    }
  }, [status]);

  const rightCardStyle = useMemo(() => {
    if (cardVariant === 'green') {
      return {
        background: 'rgba(46, 160, 67, 0.08)',
        border: '1px solid rgba(46, 160, 67, 0.3)',
      };
    }
    if (cardVariant === 'red') {
      return {
        background: 'rgba(248, 81, 73, 0.08)',
        border: '1px solid rgba(248, 81, 73, 0.3)',
      };
    }
    return {
      background: 'var(--gray-1)',
      border: '1px solid var(--gray-4)',
    };
  }, [cardVariant]);

  const loadFile = useCallback((file: File) => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setStatus('danger');
      setMessage(
        'Unsupported file type. Please use jpeg, png, webp, or static gif.',
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return;
      }

      const parsed = parseDataUrl(reader.result);
      if (!parsed) {
        setStatus('danger');
        setMessage('Could not read that image. Try another file.');
        return;
      }

      setImageUrl(reader.result);
      setImageBase64(parsed.base64);
      setImageType(parsed.mime);
      setStatus('idle');
      setMessage('Ready to ask hazcat?');
    };
    reader.readAsDataURL(file);
  }, []);

  const onPickClick = () => {
    inputRef.current?.click();
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onSubmit = async () => {
    if (!imageBase64 || !imageType) {
      setStatus('danger');
      setMessage('Pick an image first.');
      return;
    }

    setStatus('loading');
    setMessage('Asking hazcat…');

    try {
      const response = await fetch('/api/hazcat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          imageType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Request failed.');
      }

      const data = (await response.json()) as HazCatResult;
      setLastResult(data);
      if (data.hazCat) {
        setStatus('success');
        confetti({
          particleCount: 260,
          spread: 80,
          origin: { y: 0.6 },
        });
      } else {
        setStatus('danger');
        triggerSadRain();
      }
      setMessage(`${data.message} Try another image?`);
      setIsModalOpen(true);
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : 'Something went wrong.';
      setStatus('danger');
      setMessage(`${messageText} Try another image.`);
      setLastResult({ hazCat: false, message: messageText });
      setIsModalOpen(true);
    }
  };

  return (
    <Theme appearance={appearance} accentColor="plum" radius="large">
      <Box
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        <Flex align="center" gap="2">
          <Text size="3">☀️</Text>
          <Switch
            checked={appearance === 'dark'}
            onCheckedChange={(checked) =>
              setAppearance(checked ? 'dark' : 'light')
            }
          />
          <Text size="3">🌙</Text>
        </Flex>
      </Box>
      <Flex
        direction="column"
        gap="5"
        style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}
      >
        <Heading align="center" size="8">
          hazcat?
        </Heading>

        <Flex direction={{ initial: 'column', md: 'row' }} gap="5">
          <Card
            style={{
              flex: 1,
              minHeight: 360,
              borderStyle: isDragging ? 'dashed' : 'solid',
              borderWidth: 2,
              borderColor: isDragging ? 'var(--accent-9)' : 'var(--gray-7)',
            }}
            variant="surface"
            onClick={onPickClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <Flex direction="column" gap="3" style={{ height: '100%' }}>
              <Heading size="4">Image picker</Heading>
              <Text color="gray" size="2">
                Click or drop a jpeg, png, webp, or static gif.
              </Text>
              <Inset
                side="top"
                style={{
                  marginTop: '12px',
                  borderRadius: '16px',
                  border: '1px dashed var(--gray-6)',
                  background: 'var(--gray-3)',
                  flex: 1,
                  minHeight: 220,
                }}
              >
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: 16,
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Selected"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: 12,
                      }}
                    />
                  ) : (
                    <Text color="gray" size="2">
                      Image preview will appear here.
                    </Text>
                  )}
                </Flex>
              </Inset>
            </Flex>
            <input
              ref={inputRef}
              type="file"
              accept={SUPPORTED_TYPES.join(',')}
              onChange={onInputChange}
              style={{ display: 'none' }}
            />
          </Card>

          <Card
            style={{ flex: 1, minHeight: 360, ...rightCardStyle }}
            variant="surface"
          >
            <Flex direction="column" gap="4" style={{ height: '100%' }}>
              <Heading size="4">hazcat?</Heading>
              <Text color="gray" size="2">
                Supported formats: jpeg, png, webp, static gif.
              </Text>
              <Box
                style={{
                  borderRadius: 12,
                  padding: 16,
                  background:
                    cardVariant === 'green'
                      ? 'rgba(46, 160, 67, 0.1)'
                      : cardVariant === 'red'
                        ? 'rgba(248, 81, 73, 0.1)'
                        : 'var(--gray-3)',
                  border: '1px solid var(--gray-5)',
                  minHeight: 160,
                }}
              >
                <Flex direction="column" gap="3">
                  <Text size="2">{message}</Text>
                  <Text size="1" color="gray">
                    Image type: {getImageTypeLabel(imageType) || '—'}
                  </Text>
                </Flex>
              </Box>
              <Button
                onClick={onSubmit}
                disabled={!canSubmit}
                size="3"
                style={{ marginTop: 'auto' }}
              >
                {status === 'loading' ? 'Checking…' : 'hazcat?'}
              </Button>
            </Flex>
          </Card>
        </Flex>
      </Flex>
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Content style={{ maxWidth: 520 }}>
          <Dialog.Title size="8">
            {lastResult?.hazCat ? 'Cat detected!' : 'No cats found'}
          </Dialog.Title>
          <Dialog.Description size="4" style={{ marginTop: 12 }}>
            {lastResult?.message ?? message}
          </Dialog.Description>
          <Flex justify="end" mt="5">
            <Dialog.Close>
              <Button size="3">
                {lastResult?.hazCat ? 'Yay! 🎉' : 'Boo... 🥺'}
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Theme>
  );
};

export default HazCatApp;
