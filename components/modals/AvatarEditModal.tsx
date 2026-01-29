"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { uploadToBlob, shouldUploadToBlob } from "@/lib/blobUtils";
import { compressImage } from "@/lib/imageUtils";
import { getMediaSize } from "@/lib/mediaUtils";

interface AvatarEditModalProps {
	currentAvatar: string;
	originalAvatar?: string; // Ảnh gốc chưa crop
	onSave: (data: { cropped: string; original?: string }) => void;
	onClose: () => void;
	theme: "light" | "dark";
}

type UploadMode = "url" | "file";

export default function AvatarEditModal({ currentAvatar, originalAvatar, onSave, onClose, theme }: AvatarEditModalProps) {
	const [isActive, setIsActive] = useState(false);
	const [mode, setMode] = useState<UploadMode>("url");
	const [avatarUrl, setAvatarUrl] = useState(originalAvatar || currentAvatar);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isCropping, setIsCropping] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(originalAvatar || currentAvatar);
	const [isCompressing, setIsCompressing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [mediaSize, setMediaSize] = useState<string>("");

	// Crop state - movable circle with zoom and resize
	const [zoom, setZoom] = useState(1); // Zoom level (1 = 0% vừa khung, 2 = 100% phóng to)
	const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 }); // Image offset for panning
	const [cropSize, setCropSize] = useState(200); // Crop circle diameter
	const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 }); // Crop circle position (offset from center)
	const [isResizing, setIsResizing] = useState(false);
	const [isPanning, setIsPanning] = useState(false);
	const [isMovingCrop, setIsMovingCrop] = useState(false); // Moving crop circle
	const [isPinching, setIsPinching] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [resizeStart, setResizeStart] = useState<{
		distance: number;
		size: number;
	} | null>(null);
	const [pinchStart, setPinchStart] = useState<{
		distance: number;
		zoom: number;
	} | null>(null);
	const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
	const [cropMoveStart, setCropMoveStart] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const resizeHandleRef = useRef<HTMLDivElement>(null);
	const cropCircleRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const animationFrameRef = useRef<number | null>(null);
	const imagePositionRef = useRef(imagePosition);
	const cropSizeRef = useRef(cropSize);
	const cropPositionRef = useRef(cropPosition);

	useEffect(() => {
		const timer = setTimeout(() => setIsActive(true), 10);
		return () => clearTimeout(timer);
	}, []);

	// Detect mobile device
	useEffect(() => {
		const checkMobile = () => {
			const isMobileDevice =
				/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
			setIsMobile(isMobileDevice);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		// Load original avatar if exists, otherwise use current avatar
		// But only use originalAvatar if it's a URL (not base64), otherwise use currentAvatar
		const isBase64 = (str: string) => str.startsWith("data:image");
		const imageToLoad =
			originalAvatar && !isBase64(originalAvatar)
				? originalAvatar
				: currentAvatar && !isBase64(currentAvatar)
					? currentAvatar
					: originalAvatar || currentAvatar;

		setAvatarUrl(imageToLoad || "");
		setOriginalImageUrl(imageToLoad || null);
		if (imageToLoad && mode === "url") {
			setPreviewUrl(imageToLoad);
			setIsCropping(true);
		} else {
			setPreviewUrl(null);
			setSelectedFile(null);
			setIsCropping(false);
		}
		setZoom(1);
		setImagePosition({ x: 0, y: 0 });
		setCropSize(200);
		setCropPosition({ x: 0, y: 0 });
		setImageLoaded(false);
		setImageError(false);
	}, [currentAvatar, originalAvatar, mode]);

	useEffect(() => {
		if (mode === "url") {
			if (avatarUrl && avatarUrl.trim()) {
				setPreviewUrl(avatarUrl);
				setOriginalImageUrl(avatarUrl);
				setImageLoaded(false);
				setImageError(false);
				setIsCropping(false);
			} else {
				setPreviewUrl(null);
				setOriginalImageUrl(null);
				setIsCropping(false);
				setImageLoaded(false);
				setImageError(false);
			}
		}
	}, [avatarUrl, mode]);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && file.type.startsWith("image/")) {
			setSelectedFile(file);
			setMediaSize(getMediaSize(file));
			setIsCompressing(true);

			try {
				// Show preview first with original file
				const reader = new FileReader();
				reader.onload = (event) => {
					const url = event.target?.result as string;
					setPreviewUrl(url);
				};
				reader.readAsDataURL(file);

				// Compress the image
				const compressedBase64 = await compressImage(file, 1200, 1200, 0.8);
				setPreviewUrl(compressedBase64);
				setOriginalImageUrl(compressedBase64);
				setMediaSize(getMediaSize(compressedBase64));
				setIsCropping(true);
				setZoom(1);
				setImagePosition({ x: 0, y: 0 });
				setCropSize(200);
				setCropPosition({ x: 0, y: 0 });
			} catch (error) {
				console.error("Error compressing image:", error);
				// Fallback to original file if compression fails
				const reader = new FileReader();
				reader.onload = (event) => {
					const url = event.target?.result as string;
					setPreviewUrl(url);
					setOriginalImageUrl(url);
					setIsCropping(true);
					setZoom(1);
					setImagePosition({ x: 0, y: 0 });
					setCropSize(200);
					setCropPosition({ x: 0, y: 0 });
				};
				reader.readAsDataURL(file);
			} finally {
				setIsCompressing(false);
			}
		}
	};

	const handleImageLoad = () => {
		// Reset zoom and position when image loads
		setZoom(1);
		setImagePosition({ x: 0, y: 0 });
		setCropSize(200);
		setCropPosition({ x: 0, y: 0 });
		setImageLoaded(true);
		setImageError(false);
		setIsCropping(true);
	};

	const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newZoom = parseFloat(e.target.value);
		setZoom(newZoom);
	};

	const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		e.preventDefault();
		if (!containerRef.current) return;

		const rect = containerRef.current.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const handleX = e.clientX - rect.left;
		const handleY = e.clientY - rect.top;

		const distance = Math.sqrt(Math.pow(handleX - centerX, 2) + Math.pow(handleY - centerY, 2));

		setIsResizing(true);
		setResizeStart({ distance, size: cropSize });
	};

	const handleResizeTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		e.stopPropagation();
		e.preventDefault();
		if (!containerRef.current) return;
		if (e.touches.length !== 1) return; // Only handle single touch for resizing

		const rect = containerRef.current.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const touch = e.touches[0];
		const handleX = touch.clientX - rect.left;
		const handleY = touch.clientY - rect.top;

		const distance = Math.sqrt(Math.pow(handleX - centerX, 2) + Math.pow(handleY - centerY, 2));

		setIsResizing(true);
		setResizeStart({ distance, size: cropSize });
	};

	const handlePanMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!containerRef.current) return;
		e.preventDefault();
		e.stopPropagation();
		setIsPanning(true);
		setPanStart({ x: e.clientX, y: e.clientY });
	};

	const handlePanTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		if (!containerRef.current) return;

		// Handle pinch zoom with 2 fingers
		if (e.touches.length === 2) {
			e.preventDefault();
			e.stopPropagation();
			const touch1 = e.touches[0];
			const touch2 = e.touches[1];
			const distance = Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
			setIsPinching(true);
			setPinchStart({ distance, zoom });
			setIsPanning(false);
			return;
		}

		// Only handle single touch for panning
		if (e.touches.length !== 1) return;
		e.preventDefault();
		e.stopPropagation();
		const touch = e.touches[0];
		setIsPanning(true);
		setIsPinching(false);
		setPanStart({ x: touch.clientX, y: touch.clientY });
	};

	const handleCropMoveMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		e.preventDefault();
		setIsMovingCrop(true);
		setCropMoveStart({ x: e.clientX, y: e.clientY });
	};

	const handleCropMoveTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		e.stopPropagation();
		e.preventDefault();
		if (e.touches.length !== 1) return;
		const touch = e.touches[0];
		setIsMovingCrop(true);
		setCropMoveStart({ x: touch.clientX, y: touch.clientY });
	};

	const handleMouseUp = () => {
		setIsResizing(false);
		setIsPanning(false);
		setIsPinching(false);
		setIsMovingCrop(false);
		setResizeStart(null);
		setPanStart(null);
		setPinchStart(null);
		setCropMoveStart(null);
	};

	const handleTouchEnd = () => {
		setIsResizing(false);
		setIsPanning(false);
		setIsPinching(false);
		setIsMovingCrop(false);
		setResizeStart(null);
		setPanStart(null);
		setPinchStart(null);
		setCropMoveStart(null);
	};

	// Sync refs with state
	useEffect(() => {
		imagePositionRef.current = imagePosition;
	}, [imagePosition]);

	useEffect(() => {
		cropSizeRef.current = cropSize;
	}, [cropSize]);

	useEffect(() => {
		cropPositionRef.current = cropPosition;
	}, [cropPosition]);

	// Add global mouse and touch events for better UX - especially for panning
	useEffect(() => {
		const handleCropMove = (clientX: number, clientY: number) => {
			if (isMovingCrop && cropMoveStart && containerRef.current) {
				// Cancel previous animation frame
				if (animationFrameRef.current) {
					cancelAnimationFrame(animationFrameRef.current);
				}

				// Use requestAnimationFrame for smooth updates
				animationFrameRef.current = requestAnimationFrame(() => {
					if (!containerRef.current) return;

					const deltaX = clientX - cropMoveStart.x;
					const deltaY = clientY - cropMoveStart.y;

					const rect = containerRef.current.getBoundingClientRect();
					const currentCropPos = cropPositionRef.current;
					const currentCropSize = cropSizeRef.current;
					const cropRadius = currentCropSize / 2;

					// Calculate new crop position
					const newX = currentCropPos.x + deltaX;
					const newY = currentCropPos.y + deltaY;

					// Clamp crop position to stay within container
					const maxX = rect.width / 2 - cropRadius;
					const maxY = rect.height / 2 - cropRadius;
					const clampedPos = {
						x: Math.max(-maxX, Math.min(maxX, newX)),
						y: Math.max(-maxY, Math.min(maxY, newY)),
					};

					setCropPosition(clampedPos);
					setCropMoveStart({ x: clientX, y: clientY });
				});
			}
		};

		const handlePanMove = (clientX: number, clientY: number) => {
			if (isPanning && panStart && containerRef.current && imageRef.current) {
				// Cancel previous animation frame
				if (animationFrameRef.current) {
					cancelAnimationFrame(animationFrameRef.current);
				}

				// Use requestAnimationFrame for smooth updates
				animationFrameRef.current = requestAnimationFrame(() => {
					if (!containerRef.current || !imageRef.current) return;

					const deltaX = clientX - panStart.x;
					const deltaY = clientY - panStart.y;

					const rect = containerRef.current.getBoundingClientRect();
					const img = imageRef.current;
					const imgAspect = img.naturalWidth / img.naturalHeight;
					const containerAspect = rect.width / rect.height;

					// Calculate image display dimensions (before zoom)
					let displayWidth = rect.width;
					let displayHeight = rect.height;

					if (imgAspect > containerAspect) {
						displayHeight = rect.width / imgAspect;
					} else {
						displayWidth = rect.height * imgAspect;
					}

					// Apply zoom
					const zoomedWidth = displayWidth * zoom;
					const zoomedHeight = displayHeight * zoom;

					// Calculate maximum allowed movement
					const maxX = zoomedWidth > rect.width ? Math.max(0, (zoomedWidth - rect.width) / 2) : 0;
					const maxY = zoomedHeight > rect.height ? Math.max(0, (zoomedHeight - rect.height) / 2) : 0;

					// Update position using ref for immediate calculation
					const currentPos = imagePositionRef.current;
					const newX = currentPos.x + deltaX;
					const newY = currentPos.y + deltaY;
					const clampedPos = {
						x: maxX > 0 ? Math.max(-maxX, Math.min(maxX, newX)) : 0,
						y: maxY > 0 ? Math.max(-maxY, Math.min(maxY, newY)) : 0,
					};

					setImagePosition(clampedPos);
					setPanStart({ x: clientX, y: clientY });
				});
			}
		};

		const handleResizeMove = (clientX: number, clientY: number) => {
			if (isResizing && resizeStart && containerRef.current && imageRef.current) {
				// Cancel previous animation frame
				if (animationFrameRef.current) {
					cancelAnimationFrame(animationFrameRef.current);
				}

				// Use requestAnimationFrame for smooth updates
				animationFrameRef.current = requestAnimationFrame(() => {
					if (!containerRef.current || !imageRef.current) return;

					const rect = containerRef.current.getBoundingClientRect();
					const img = imageRef.current;

					// Tính toán kích thước ảnh hiển thị (sau zoom)
					const imgAspect = img.naturalWidth / img.naturalHeight;
					const containerAspect = rect.width / rect.height;

					let displayWidth = rect.width;
					let displayHeight = rect.height;

					if (imgAspect > containerAspect) {
						displayHeight = rect.width / imgAspect;
					} else {
						displayWidth = rect.height * imgAspect;
					}

					// Apply zoom để có kích thước thực tế
					const zoomedWidth = displayWidth * zoom;
					const zoomedHeight = displayHeight * zoom;

					// Tính toán vị trí ảnh trong container (sử dụng ref để có giá trị mới nhất)
					const baseImgX = (rect.width - zoomedWidth) / 2;
					const baseImgY = (rect.height - zoomedHeight) / 2;
					const currentPos = imagePositionRef.current;
					const imgX = baseImgX + currentPos.x;
					const imgY = baseImgY + currentPos.y;

					// Vùng ảnh thực tế trong container
					const imageLeft = Math.max(0, imgX);
					const imageRight = Math.min(rect.width, imgX + zoomedWidth);
					const imageTop = Math.max(0, imgY);
					const imageBottom = Math.min(rect.height, imgY + zoomedHeight);

					// Crop center có thể di chuyển
					const currentCropPos = cropPositionRef.current;
					const centerX = rect.width / 2 + currentCropPos.x;
					const centerY = rect.height / 2 + currentCropPos.y;

					// Tính khoảng cách từ crop center đến biên ảnh gần nhất
					const maxRadiusX = Math.min(Math.abs(centerX - imageLeft), Math.abs(centerX - imageRight));
					const maxRadiusY = Math.min(Math.abs(centerY - imageTop), Math.abs(centerY - imageBottom));

					// Crop circle phải nằm hoàn toàn trong ảnh
					const maxCropRadius = Math.min(maxRadiusX, maxRadiusY);
					const maxCropSize = Math.max(50, maxCropRadius * 2);
					const minCropSize = 50;

					// Tính khoảng cách từ center đến điểm resize
					const pointX = clientX - rect.left;
					const pointY = clientY - rect.top;
					const distance = Math.sqrt(Math.pow(pointX - centerX, 2) + Math.pow(pointY - centerY, 2));

					// Tính crop size mới
					const distanceDelta = distance - resizeStart.distance;
					let newSize = resizeStart.size + distanceDelta * 2;
					newSize = Math.max(minCropSize, Math.min(maxCropSize, newSize));

					setCropSize(newSize);
				});
			}
		};

		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (isMovingCrop && cropMoveStart) {
				handleCropMove(e.clientX, e.clientY);
			} else if (isPanning && panStart) {
				handlePanMove(e.clientX, e.clientY);
			} else if (isResizing && resizeStart && containerRef.current && imageRef.current) {
				handleResizeMove(e.clientX, e.clientY);
			}
		};

		const handlePinchZoom = (touch1: Touch, touch2: Touch) => {
			if (!pinchStart) return;

			// Cancel previous animation frame
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}

			// Use requestAnimationFrame for smooth updates
			animationFrameRef.current = requestAnimationFrame(() => {
				const currentDistance = Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));

				const distanceRatio = currentDistance / pinchStart.distance;
				const newZoom = Math.max(1, Math.min(2, pinchStart.zoom * distanceRatio));

				setZoom(newZoom);
			});
		};

		const handleGlobalTouchMove = (e: TouchEvent) => {
			// Handle pinch zoom with 2 fingers
			if (e.touches.length === 2) {
				e.preventDefault();
				e.stopPropagation();

				if (isPinching && pinchStart) {
					handlePinchZoom(e.touches[0], e.touches[1]);
				} else {
					// Start pinch if not already pinching
					const touch1 = e.touches[0];
					const touch2 = e.touches[1];
					const distance = Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
					setIsPinching(true);
					setPinchStart({ distance, zoom });
				}
				return;
			}

			// Handle single touch for panning/resizing
			if (e.touches.length !== 1) {
				// If we had 2 touches and now have less, stop pinching
				if (isPinching) {
					setIsPinching(false);
					setPinchStart(null);
				}
				return;
			}

			const touch = e.touches[0];

			if (isMovingCrop && cropMoveStart) {
				e.preventDefault(); // Prevent scrolling
				handleCropMove(touch.clientX, touch.clientY);
			} else if (isPanning && panStart) {
				e.preventDefault(); // Prevent scrolling
				handlePanMove(touch.clientX, touch.clientY);
			} else if (isResizing && resizeStart && containerRef.current && imageRef.current) {
				e.preventDefault(); // Prevent scrolling
				handleResizeMove(touch.clientX, touch.clientY);
			}
		};

		const handleGlobalMouseUp = () => {
			handleMouseUp();
		};

		const handleGlobalTouchEnd = () => {
			handleTouchEnd();
		};

		if (isResizing || isPanning || isPinching || isMovingCrop) {
			document.addEventListener("mousemove", handleGlobalMouseMove);
			document.addEventListener("mouseup", handleGlobalMouseUp);
			document.addEventListener("touchmove", handleGlobalTouchMove, {
				passive: false,
			});
			document.addEventListener("touchend", handleGlobalTouchEnd);
			document.addEventListener("touchcancel", handleGlobalTouchEnd);
		}

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			document.removeEventListener("mousemove", handleGlobalMouseMove);
			document.removeEventListener("mouseup", handleGlobalMouseUp);
			document.removeEventListener("touchmove", handleGlobalTouchMove);
			document.removeEventListener("touchend", handleGlobalTouchEnd);
			document.removeEventListener("touchcancel", handleGlobalTouchEnd);
		};
	}, [isResizing, isMovingCrop, isPanning, isPinching, resizeStart, panStart, pinchStart, cropMoveStart, zoom]);

	const getCroppedImage = (): Promise<string> => {
		return new Promise((resolve) => {
			const imageSrc = mode === "url" && avatarUrl && avatarUrl.trim() ? avatarUrl : mode === "file" && previewUrl ? previewUrl : null;
			if (!imageSrc || !imageRef.current || !containerRef.current) {
				resolve(imageSrc || avatarUrl);
				return;
			}

			const img = imageRef.current;
			const container = containerRef.current;
			const containerRect = container.getBoundingClientRect();

			// Calculate image display dimensions với objectFit: contain (before zoom)
			const imgAspect = img.naturalWidth / img.naturalHeight;
			const containerAspect = containerRect.width / containerRect.height;

			let displayWidth = containerRect.width;
			let displayHeight = containerRect.height;

			if (imgAspect > containerAspect) {
				// Image rộng hơn - fit theo width, có viền đen trên/dưới
				displayHeight = containerRect.width / imgAspect;
			} else {
				// Image cao hơn - fit theo height, có viền đen trái/phải
				displayWidth = containerRect.height * imgAspect;
			}

			// Apply zoom
			const zoomedWidth = displayWidth * zoom;
			const zoomedHeight = displayHeight * zoom;

			// Vị trí ảnh trong container (center + offset từ panning)
			const baseImgX = (containerRect.width - zoomedWidth) / 2;
			const baseImgY = (containerRect.height - zoomedHeight) / 2;
			const imgX = baseImgX + imagePosition.x;
			const imgY = baseImgY + imagePosition.y;

			// Crop area (circle) có thể di chuyển
			const centerX = containerRect.width / 2 + cropPosition.x;
			const centerY = containerRect.height / 2 + cropPosition.y;
			const cropRadius = cropSize / 2;

			// Chuyển đổi crop area từ container coordinates sang image coordinates
			// Crop circle center trong image local coordinates (0,0 là góc trên trái của ảnh đã zoom)
			let cropCenterInImageX = centerX - imgX;
			let cropCenterInImageY = centerY - imgY;

			// Kiểm tra và điều chỉnh nếu crop center nằm ngoài vùng ảnh (trong viền đen)
			// Đảm bảo crop center luôn nằm trong vùng ảnh thực sự
			cropCenterInImageX = Math.max(cropRadius, Math.min(zoomedWidth - cropRadius, cropCenterInImageX));
			cropCenterInImageY = Math.max(cropRadius, Math.min(zoomedHeight - cropRadius, cropCenterInImageY));

			// Scale từ display coordinates (sau zoom) sang actual image coordinates
			const scaleX = img.naturalWidth / zoomedWidth;
			const scaleY = img.naturalHeight / zoomedHeight;
			// Dùng scale trung bình để crop vuông vức (circular crop)
			const scale = Math.min(scaleX, scaleY);

			// Crop area trong actual image coordinates
			const cropCenterInActualX = cropCenterInImageX * scaleX;
			const cropCenterInActualY = cropCenterInImageY * scaleY;
			const actualCropSize = cropSize * scale;
			const actualCropRadius = actualCropSize / 2;

			// Tính toán vị trí crop trong actual image, đảm bảo không vượt quá biên ảnh
			let sourceX = cropCenterInActualX - actualCropRadius;
			let sourceY = cropCenterInActualY - actualCropRadius;

			// Clamp để đảm bảo crop không vượt quá biên ảnh - chỉ crop phần ảnh thực sự
			sourceX = Math.max(0, Math.min(img.naturalWidth - actualCropSize, sourceX));
			sourceY = Math.max(0, Math.min(img.naturalHeight - actualCropSize, sourceY));

			// Đảm bảo crop size không vượt quá ảnh
			const finalCropSize = Math.min(actualCropSize, img.naturalWidth - sourceX, img.naturalHeight - sourceY);

			// Create circular crop using canvas
			const canvas = document.createElement("canvas");
			canvas.width = 400;
			canvas.height = 400;
			const ctx = canvas.getContext("2d");

			if (ctx) {
				// Tạo clipping path hình tròn
				ctx.beginPath();
				ctx.arc(200, 200, 200, 0, Math.PI * 2);
				ctx.clip();

				// Vẽ ảnh đã crop - chỉ phần ảnh thực sự, không có viền đen
				if (finalCropSize > 0) {
					ctx.drawImage(img, sourceX, sourceY, finalCropSize, finalCropSize, 0, 0, 400, 400);
				}

				resolve(canvas.toDataURL("image/png"));
			} else {
				resolve(imageSrc || avatarUrl);
			}
		});
	};

	const handleSave = async () => {
		if (isSaving) return; // Prevent double-click

		setIsSaving(true);
		try {
			if (mode === "url" && avatarUrl && avatarUrl.trim()) {
				if (isCropping && previewUrl && originalImageUrl && imageLoaded && !imageError) {
					try {
						let croppedImageUrl = await getCroppedImage();
						let finalOriginalUrl = originalImageUrl;

						if (shouldUploadToBlob(croppedImageUrl)) {
							croppedImageUrl = await uploadToBlob(croppedImageUrl, `avatar-cropped-${Date.now()}.jpg`);
						}

						if (shouldUploadToBlob(finalOriginalUrl)) {
							finalOriginalUrl = await uploadToBlob(finalOriginalUrl, `avatar-original-${Date.now()}.jpg`);
						}

						onSave({
							cropped: croppedImageUrl,
							original: finalOriginalUrl,
						});
					} catch (error) {
						console.error("Crop failed:", error);
						onSave({
							cropped: avatarUrl,
							original: avatarUrl,
						});
					}
				} else {
					onSave({
						cropped: avatarUrl,
						original: avatarUrl,
					});
				}
			} else if (mode === "file" && previewUrl && isCropping && originalImageUrl && imageLoaded) {
				let croppedImageUrl = await getCroppedImage();
				let finalOriginalUrl = originalImageUrl;

				if (shouldUploadToBlob(croppedImageUrl)) {
					croppedImageUrl = await uploadToBlob(croppedImageUrl, `avatar-cropped-${Date.now()}.jpg`);
				}

				if (shouldUploadToBlob(finalOriginalUrl)) {
					finalOriginalUrl = await uploadToBlob(finalOriginalUrl, `avatar-original-${Date.now()}.jpg`);
				}

				onSave({
					cropped: croppedImageUrl,
					original: finalOriginalUrl,
				});
			}

			setIsActive(false);
			document.body.style.overflow = "";
			setTimeout(() => {
				onClose();
			}, 500);
		} catch (error) {
			console.error("Save error:", error);
			setIsSaving(false);
		}
	};

	const handleClose = () => {
		setIsActive(false);
		document.body.style.overflow = "";
		setTimeout(() => {
			onClose();
		}, 500);
	};

	const displayImageUrl = mode === "url" && avatarUrl && avatarUrl.trim() ? avatarUrl : mode === "file" && previewUrl ? previewUrl : null;

	return (
		<div className={`story-overlay ${isActive ? "active" : ""}`} style={{ zIndex: 2000 }}>
			<div className="story-container">
				{/* Nút X bên trái - giữ nguyên vị trí cũ */}
				<button className="story-close-btn" onClick={handleClose} title="Đóng">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>

				{/* Title ở giữa */}
				<h2
					style={{
						position: "absolute",
						top: "30px",
						left: "50%",
						transform: "translateX(-50%)",
						color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
						fontSize: "20px",
						fontWeight: "600",
						margin: 0,
						zIndex: 100,
					}}
				>
					Chỉnh sửa Avatar
				</h2>

				{/* Nút Save bên phải - đối xứng với nút X */}
				<button
					onClick={handleSave}
					disabled={isSaving || (mode === "url" ? !avatarUrl.trim() : !previewUrl || !isCropping || !imageLoaded)}
					title={isSaving ? "Đang lưu..." : "Lưu"}
					style={{
						position: "absolute",
						top: "20px",
						right: "20px",
						width: "40px",
						height: "40px",
						borderRadius: "50%",
						background:
							isSaving || (mode === "url" ? !avatarUrl.trim() : !previewUrl || !isCropping || !imageLoaded)
								? "rgba(59, 130, 246, 0.5)"
								: "var(--accent-blue)",
						border: "none",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						cursor:
							isSaving || (mode === "url" ? !avatarUrl.trim() : !previewUrl || !isCropping || !imageLoaded) ? "not-allowed" : "pointer",
						transition: "all 0.3s ease",
						opacity: isSaving || (mode === "url" ? !avatarUrl.trim() : !previewUrl || !isCropping || !imageLoaded) ? 0.5 : 1,
						zIndex: 100,
					}}
					onMouseEnter={(e) => {
						if (!isSaving && !(mode === "url" ? !avatarUrl.trim() : !previewUrl || !isCropping || !imageLoaded)) {
							e.currentTarget.style.transform = "scale(1.1)";
						}
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = "scale(1)";
					}}
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
						<polyline points="17 21 17 13 7 13 7 21"></polyline>
						<polyline points="7 3 7 8 15 8"></polyline>
					</svg>
				</button>

				<div
					ref={scrollContainerRef}
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						padding: "80px 20px 30px",
						overflowY: "auto",
						overflowX: "hidden",
						maxHeight: "100%",
					}}
				>
					{/* Mode selector */}
					<div
						style={{
							display: "flex",
							gap: "10px",
							marginBottom: "20px",
							width: "100%",
							maxWidth: "400px",
						}}
					>
						<button
							onClick={() => {
								setMode("url");
								setSelectedFile(null);
								const isBase64 = (str: string) => str && str.startsWith("data:image");
								let imageToLoad = "";
								if (originalAvatar && !isBase64(originalAvatar)) {
									imageToLoad = originalAvatar;
								} else if (currentAvatar && !isBase64(currentAvatar)) {
									imageToLoad = currentAvatar;
								} else if (originalAvatar) {
									imageToLoad = "";
								} else {
									imageToLoad = currentAvatar || "";
								}
								setAvatarUrl(imageToLoad);
								if (imageToLoad && imageToLoad.trim()) {
									setPreviewUrl(imageToLoad);
									setOriginalImageUrl(imageToLoad);
									setIsCropping(false);
									setImageLoaded(false);
									setImageError(false);
								} else {
									setPreviewUrl(null);
									setOriginalImageUrl(null);
									setIsCropping(false);
									setImageLoaded(false);
									setImageError(false);
								}
								setZoom(1);
								setImagePosition({ x: 0, y: 0 });
								setCropPosition({ x: 0, y: 0 });
							}}
							style={{
								flex: 1,
								padding: "10px 20px",
								borderRadius: "8px",
								border: "none",
								background:
									mode === "url" ? "var(--accent-blue)" : theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
								color: mode === "url" ? "white" : theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
								fontSize: "14px",
								fontWeight: "500",
								cursor: "pointer",
								transition: "all 0.3s ease",
							}}
						>
							URL
						</button>
						<button
							onClick={() => {
								setMode("file");
								setPreviewUrl(null);
								setSelectedFile(null);
								setIsCropping(false);
								setImageLoaded(false);
								setImageError(false);
								setOriginalImageUrl(null);
								setZoom(1);
								setImagePosition({ x: 0, y: 0 });
								setCropPosition({ x: 0, y: 0 });
							}}
							style={{
								flex: 1,
								padding: "10px 20px",
								borderRadius: "8px",
								border: "none",
								background:
									mode === "file" ? "var(--accent-blue)" : theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
								color: mode === "file" ? "white" : theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
								fontSize: "14px",
								fontWeight: "500",
								cursor: "pointer",
								transition: "all 0.3s ease",
							}}
						>
							Chọn tệp
						</button>
					</div>

					<div
						style={{
							width: "100%",
							maxWidth: "400px",
							display: "flex",
							flexDirection: "column",
							gap: "20px",
						}}
					>
						{mode === "url" ? (
							<>
								<input
									type="url"
									value={avatarUrl}
									onChange={(e) => {
										setAvatarUrl(e.target.value);
										if (e.target.value) {
											setOriginalImageUrl(e.target.value);
										}
									}}
									placeholder="Nhập URL ảnh..."
									style={{
										width: "100%",
										padding: "14px 20px",
										borderRadius: "12px",
										border: theme === "dark" ? "2px solid rgba(255, 255, 255, 0.3)" : "2px solid rgba(0, 0, 0, 0.2)",
										background: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
										color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
										fontSize: "16px",
										outline: "none",
									}}
									autoFocus
								/>
							</>
						) : (
							<>
								<input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
								<button
									onClick={() => fileInputRef.current?.click()}
									style={{
										width: "100%",
										padding: "14px 20px",
										borderRadius: "12px",
										border: theme === "dark" ? "2px solid rgba(255, 255, 255, 0.3)" : "2px solid rgba(0, 0, 0, 0.2)",
										background: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
										color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
										fontSize: "16px",
										cursor: "pointer",
										transition: "all 0.3s ease",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.opacity = "0.8";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.opacity = "1";
									}}
								>
									{isCompressing ? "Đang nén ảnh..." : selectedFile ? selectedFile.name : "Chọn ảnh từ thiết bị"}
								</button>
								{mediaSize && (
									<p
										style={{
											marginTop: "8px",
											fontSize: "12px",
											color: theme === "dark" ? "var(--text-secondary-dark)" : "var(--text-secondary-light)",
										}}
									>
										Kích thước: {mediaSize}
									</p>
								)}
							</>
						)}

						{displayImageUrl && (
							<div
								style={{
									width: "100%",
									maxWidth: "400px",
									margin: "0 auto",
								}}
							>
								{isCropping && imageLoaded && !imageError && displayImageUrl && (
									<div
										style={{
											marginBottom: "15px",
											display: "flex",
											flexDirection: "column",
											gap: "8px",
										}}
									>
										{!isMobile && (
											<>
												<div
													style={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
													}}
												>
													<label
														style={{
															fontSize: "14px",
															color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
															fontWeight: "500",
														}}
													>
														Zoom: {Math.round((zoom - 1) * 100)}%
													</label>
												</div>
												<input
													type="range"
													min="1"
													max="2"
													step="0.01"
													value={zoom}
													onChange={handleZoomChange}
													onMouseDown={(e) => e.stopPropagation()}
												/>
											</>
										)}
									</div>
								)}

								<div
									ref={containerRef}
									style={{
										position: "relative",
										width: "100%",
										height: "400px",
										overflow: "hidden",
										borderRadius: "12px",
										border: theme === "dark" ? "2px solid rgba(255, 255, 255, 0.3)" : "2px solid rgba(0, 0, 0, 0.2)",
										cursor: isPanning ? "grabbing" : "grab",
										touchAction: "none", // Prevent default touch behaviors like scrolling
									}}
									onMouseUp={handleMouseUp}
									onMouseDown={(e) => {
										// Only pan if not clicking on resize handle or crop circle
										if (
											(resizeHandleRef.current && resizeHandleRef.current.contains(e.target as Node)) ||
											(cropCircleRef.current && cropCircleRef.current.contains(e.target as Node))
										) {
											return;
										}
										handlePanMouseDown(e);
									}}
									onTouchStart={(e) => {
										// Only pan if not touching on resize handle or crop circle
										if (
											(resizeHandleRef.current && resizeHandleRef.current.contains(e.target as Node)) ||
											(cropCircleRef.current && cropCircleRef.current.contains(e.target as Node))
										) {
											return;
										}
										handlePanTouchStart(e);
									}}
									onTouchEnd={handleTouchEnd}
								>
									<div
										style={{
											position: "absolute",
											width: "100%",
											height: "100%",
											transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
											willChange: "transform",
											backfaceVisibility: "hidden",
											WebkitBackfaceVisibility: "hidden",
											transition: isResizing || isPanning ? "none" : "transform 0.1s ease-out",
										}}
									>
										<Image
											ref={imageRef}
											src={displayImageUrl}
											alt="Preview"
											fill
											quality={80}
											sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 600px"
											loading="lazy"
											style={{
												objectFit: "contain",
												userSelect: "none",
												pointerEvents: "none",
												transform: `scale(${zoom})`,
												transformOrigin: "center center",
											}}
											unoptimized
											onLoad={handleImageLoad}
											onError={() => {
												if (mode === "url") {
													setImageError(true);
													setImageLoaded(false);
													setIsCropping(false);
												}
											}}
										/>
									</div>

									{/* Overlay with circular crop - có thể di chuyển */}
									<div
										ref={cropCircleRef}
										onMouseDown={handleCropMoveMouseDown}
										onTouchStart={handleCropMoveTouchStart}
										onTouchEnd={handleTouchEnd}
										style={{
											position: "absolute",
											top: "50%",
											left: "50%",
											transform: `translate(calc(-50% + ${cropPosition.x}px), calc(-50% + ${cropPosition.y}px))`,
											width: `${cropSize}px`,
											height: `${cropSize}px`,
											borderRadius: "50%",
											border: "3px solid white",
											boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1)",
											pointerEvents: "auto",
											cursor: isMovingCrop ? "grabbing" : "move",
											zIndex: 5,
											touchAction: "none",
										}}
									/>

									{/* Resize handle */}
									<div
										ref={resizeHandleRef}
										onMouseDown={handleResizeMouseDown}
										onTouchStart={handleResizeTouchStart}
										onTouchEnd={handleTouchEnd}
										style={{
											position: "absolute",
											top: "50%",
											left: "50%",
											transform: `translate(calc(-50% + ${cropPosition.x + cropSize / 2}px), calc(-50% + ${cropPosition.y}px))`,
											width: "24px",
											height: "24px",
											borderRadius: "50%",
											background: "white",
											border: "2px solid var(--accent-blue)",
											cursor: "nwse-resize",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											zIndex: 10,
											pointerEvents: "auto",
											boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
											touchAction: "none", // Prevent default touch behaviors
										}}
									>
										<div
											style={{
												width: "8px",
												height: "8px",
												borderRadius: "50%",
												background: "var(--accent-blue)",
											}}
										/>
									</div>
								</div>
								<p
									style={{
										marginTop: "10px",
										fontSize: "12px",
										textAlign: "center",
										color: theme === "dark" ? "var(--text-secondary-dark)" : "var(--text-secondary-light)",
									}}
								>
									{imageError ? (
										<span style={{ color: "#ef4444" }}>
											⚠️ Không thể tải ảnh. URL có thể không hợp lệ. Bạn vẫn có thể lưu URL.
										</span>
									) : !imageLoaded ? (
										<span>Đang tải ảnh...</span>
									) : isCropping ? (
										isMobile ? (
											"Kéo vòng tròn để di chuyển • Kéo nút tròn để resize • Chụm 2 ngón tay để zoom • Kéo ảnh để điều chỉnh"
										) : (
											"Kéo vòng tròn để di chuyển • Kéo nút tròn để resize • Dùng slider để zoom • Kéo ảnh để điều chỉnh"
										)
									) : (
										"Ảnh đang được tải..."
									)}
								</p>
							</div>
						)}
					</div>

					{/* Nút Xóa để về avatar mặc định */}
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							marginTop: "20px",
							width: "100%",
							maxWidth: "400px",
						}}
					>
						<button
							onClick={() => {
								// Reset về avatar mặc định
								const defaultAvatar = "https://i.pinimg.com/1200x/3c/67/75/3c67757cef723535a7484a6c7bfbfc43.jpg";
								onSave({
									cropped: defaultAvatar,
									original: defaultAvatar,
								});
								setIsActive(false);
								document.body.style.overflow = "";
								setTimeout(() => {
									onClose();
								}, 500);
							}}
							style={{
								padding: "12px 30px",
								borderRadius: "8px",
								background: "#ef4444",
								color: "white",
								border: "none",
								fontSize: "16px",
								fontWeight: "500",
								cursor: "pointer",
								transition: "all 0.3s ease",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = "#dc2626";
								e.currentTarget.style.transform = "translateY(-2px)";
								e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = "#ef4444";
								e.currentTarget.style.transform = "translateY(0)";
								e.currentTarget.style.boxShadow = "none";
							}}
						>
							Xóa và về Avatar mặc định
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
