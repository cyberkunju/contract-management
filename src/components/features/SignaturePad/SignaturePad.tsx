/**
 * SignaturePad Component
 * Canvas-based signature capture with status-aware behavior
 */

import { useRef, useEffect, useState } from 'react';
import { Button } from '../../ui';
import styles from './SignaturePad.module.css';

type SignatureStatus = 'drafting' | 'pending' | 'ready' | 'signed';

interface SignaturePadProps {
    /** Label for the field */
    label?: string;
    /** Current signature value (base64) */
    value: string | null;
    /** Change handler */
    onChange: (value: string | null) => void;
    /** Whether the field is required */
    required?: boolean;
    /** Whether the field is disabled (read-only) */
    disabled?: boolean;
    /** Signature status for visual states */
    signatureStatus?: SignatureStatus;
    /** Signer name for placeholder */
    signerName?: string;
}

export function SignaturePad({
    label,
    value,
    onChange,
    required = false,
    disabled = false,
    signatureStatus = 'ready',
    signerName = 'Client',
}: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(!!value);

    // Determine if signing is allowed
    const canSign = signatureStatus === 'ready' && !disabled;
    const isWaiting = signatureStatus === 'drafting' || signatureStatus === 'pending';

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match container
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = 150;

        // Fill with appropriate background
        ctx.fillStyle = isWaiting ? '#f8f8f6' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Configure drawing
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, [isWaiting]);

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();

        if ('touches' in e) {
            const touch = e.touches[0];
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
            };
        }

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!canSign) return;

        const coords = getCoordinates(e);
        if (!coords) return;

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canSign) return;

        const coords = getCoordinates(e);
        if (!coords) return;

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        const canvas = canvasRef.current;
        if (canvas && hasSignature) {
            const dataUrl = canvas.toDataURL('image/png');
            onChange(dataUrl);
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        onChange(null);
    };

    // Get placeholder text based on status
    const getPlaceholderText = () => {
        if (signatureStatus === 'signed' && value) return null;
        if (signatureStatus === 'drafting') return 'Signature required after sending';
        if (signatureStatus === 'pending') return 'Click "Sign Contract" below to sign';
        if (signatureStatus === 'ready') return 'Sign here';
        return 'Sign here';
    };

    // Show the saved signature image when signed or when value exists and disabled
    if ((signatureStatus === 'signed' || disabled) && value) {
        return (
            <div className={styles.signaturePad}>
                {label && (
                    <label className={`${styles.label} ${required ? styles.required : ''}`}>
                        {label}
                    </label>
                )}
                <img src={value} alt="Signature" className={styles.signedImage} />
                {signatureStatus === 'signed' && (
                    <div className={styles.signedLabel}>Signed by {signerName}</div>
                )}
            </div>
        );
    }

    // Determine wrapper class based on status
    const wrapperClass = [
        styles.canvasWrapper,
        isWaiting ? styles.waiting : '',
        !canSign ? styles.disabled : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={styles.signaturePad}>
            {label && (
                <label className={`${styles.label} ${required ? styles.required : ''}`}>
                    {label}
                </label>
            )}
            <div className={wrapperClass}>
                <canvas
                    ref={canvasRef}
                    className={styles.canvas}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                {!hasSignature && (
                    <div className={styles.placeholder}>
                        {getPlaceholderText()}
                    </div>
                )}
            </div>
            {canSign && (
                <div className={styles.actions}>
                    <Button type="button" variant="ghost" size="sm" onClick={clearSignature}>
                        Clear
                    </Button>
                </div>
            )}
        </div>
    );
}
