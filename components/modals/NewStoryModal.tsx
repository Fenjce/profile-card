"use client";

import { useState, useEffect, useRef } from "react";
import { Story } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { compressImage } from "@/lib/imageUtils";
import { processVideo, getMediaSize } from "@/lib/mediaUtils";
import { Messages } from "@/lib/messages";
import { uploadToBlob, shouldUploadToBlob } from "@/lib/blobUtils";
import Image from "next/image";

interface NewStoryModalProps {
	userName: string;
	userAvatar: string;
	onSave: (story: Story) => void;
	onClose: () => void;
	theme: "light" | "dark";
	showToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function NewStoryModal({ userName, userAvatar, onSave, onClose, theme, showToast }: NewStoryModalProps) {
	const [isActive, setIsActive] = useState(false);
	const [content, setContent] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [videoUrl, setVideoUrl] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
	const [mediaSize, setMediaSize] = useState<string>("");
	const [isCompressing, setIsCompressing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [expiresIn, setExpiresIn] = useState<string>("24");
	const [pinned, setPinned] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => setIsActive(true), 10);
		return () => clearTimeout(timer);
	}, []);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setSelectedFile(file);
		setMediaSize(getMediaSize(file));
		setIsCompressing(true);

		// Clear previous media
		setImageUrl("");
		setVideoUrl("");

		if (file.type.startsWith("image/")) {
			setPreviewType("image");
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
				setImageUrl(compressedBase64);
				setPreviewUrl(compressedBase64);
				setMediaSize(getMediaSize(compressedBase64));
			} catch (error) {
				console.error("Error compressing image:", error);
				const reader = new FileReader();
				reader.onload = (event) => {
					const url = event.target?.result as string;
					setPreviewUrl(url);
					setImageUrl(url);
				};
				reader.readAsDataURL(file);
			} finally {
				setIsCompressing(false);
			}
		} else if (file.type.startsWith("video/")) {
			setPreviewType("video");
			try {
				const videoBase64 = await processVideo(file, 10);
				setVideoUrl(videoBase64);
				setPreviewUrl(videoBase64);
				setMediaSize(getMediaSize(videoBase64));
			} catch (error: any) {
				console.error("Error processing video:", error);
				if (showToast) {
					showToast(error.message || Messages.VIDEO_PROCESS_ERROR, "error");
				}
				setPreviewUrl(null);
				setSelectedFile(null);
				setMediaSize("");
			} finally {
				setIsCompressing(false);
			}
		}
	};

	const handleSave = async () => {
		if (!content.trim() && !imageUrl.trim() && !videoUrl.trim()) {
			return;
		}

		if (isSaving) return; // Prevent double-click

		setIsSaving(true);
		try {
			let finalImageUrl = imageUrl.trim() || undefined;
			let finalVideoUrl = videoUrl.trim() || undefined;

			if (finalImageUrl && shouldUploadToBlob(finalImageUrl)) {
				try {
					finalImageUrl = await uploadToBlob(finalImageUrl, `story-image-${Date.now()}.jpg`);
				} catch (error: any) {
					console.warn("Upload to blob failed, using base64:", error.message);
					// Giữ nguyên base64 nếu upload lỗi
				}
			}

			if (finalVideoUrl && shouldUploadToBlob(finalVideoUrl)) {
				try {
					finalVideoUrl = await uploadToBlob(finalVideoUrl, `story-video-${Date.now()}.mp4`);
				} catch (error: any) {
					console.warn("Upload to blob failed, using base64:", error.message);
					// Giữ nguyên base64 nếu upload lỗi
				}
			}

			const now = new Date();
			// Xử lý expiresIn: nếu là -1 hoặc rỗng thì để -1 (không hết hạn)
			let expiresInValue = -1;
			const trimmedExpiresIn = expiresIn.trim();
			if (trimmedExpiresIn !== "" && trimmedExpiresIn !== "-1") {
				const parsed = parseInt(trimmedExpiresIn, 10);
				expiresInValue = isNaN(parsed) ? 24 : parsed;
			}

			const newStory: Story = {
				// author và avatar không lưu, tự động lấy từ config.user
				createdAt: formatDate(now),
				content: content.trim() || undefined,
				image: finalImageUrl,
				video: finalVideoUrl,
				mediaSize: mediaSize || undefined,
				expiresIn: expiresInValue,
				pinned: pinned,
			};

			onSave(newStory);

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

	return (
		<div className={`story-overlay ${isActive ? "active" : ""}`} style={{ zIndex: 2000 }}>
			<div className="story-container">
				<button className="story-close-btn" onClick={handleClose} title={Messages.MODAL_CLOSE}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>

				{/* Pin Icon - Top Right */}
				<button
					onClick={() => setPinned(!pinned)}
					style={{
						position: "absolute",
						top: "20px",
						right: "20px",
						width: "40px",
						height: "40px",
						borderRadius: "8px",
						background: pinned ? "rgba(59, 130, 246, 0.2)" : "transparent",
						border: "none",
						color: pinned ? "var(--accent-blue)" : theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						transition: "all 0.3s ease",
						opacity: 0.6,
						zIndex: 1001,
					}}
					title={pinned ? "Bỏ ghim story" : "Ghim story lên đầu"}
					onMouseEnter={(e) => {
						e.currentTarget.style.opacity = "1";
						e.currentTarget.style.transform = "scale(1.1)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.opacity = "0.6";
						e.currentTarget.style.transform = "scale(1)";
					}}
				>
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill={pinned ? "currentColor" : "none"}
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M12 17v5"></path>
						<path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path>
					</svg>
				</button>

				<h2 className="story-modal-title">{Messages.BUTTON_ADD_STORY}</h2>

				<div
					ref={scrollContainerRef}
					style={{
						display: "flex",
						flexDirection: "column",
						padding: "0",
						overflowY: "auto",
						overflowX: "hidden",
						maxHeight: "100%",
						height: "100%",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "20px",
							width: "100%",
						}}
					>
						{/* Content Input */}
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "8px",
									fontSize: "14px",
									fontWeight: "500",
									color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
								}}
							>
								{Messages.PLACEHOLDER_CONTENT}
							</label>
							<textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder={Messages.PLACEHOLDER_CONTENT}
								rows={6}
								style={{
									width: "100%",
									padding: "12px 16px",
									borderRadius: "12px",
									border: theme === "dark" ? "2px solid rgba(255, 255, 255, 0.3)" : "2px solid rgba(0, 0, 0, 0.2)",
									background: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
									color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
									fontSize: "14px",
									fontFamily: "inherit",
									outline: "none",
									resize: "vertical",
									minHeight: "120px",
								}}
							/>
						</div>

						{/* Media Input */}
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "8px",
									fontSize: "14px",
									fontWeight: "500",
									color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
								}}
							>
								{Messages.STORY_MEDIA_LABEL}
							</label>

							{/* Media URL Input */}
							<input
								type="url"
								value={imageUrl || videoUrl}
								onChange={(e) => {
									const url = e.target.value;
									// Auto detect if it's video or image based on extension or clear both
									if (!url) {
										setImageUrl("");
										setVideoUrl("");
										setPreviewUrl(null);
										setPreviewType(null);
										setMediaSize("");
										return;
									}

									const isVideo = /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i.test(url);
									if (isVideo) {
										setVideoUrl(url);
										setImageUrl("");
										setPreviewType("video");
									} else {
										setImageUrl(url);
										setVideoUrl("");
										setPreviewType("image");
									}
									setPreviewUrl(url);
									setSelectedFile(null);
									setMediaSize("");
								}}
								placeholder={Messages.STORY_MEDIA_URL_PLACEHOLDER}
								style={{
									width: "100%",
									padding: "12px 16px",
									borderRadius: "12px",
									border: theme === "dark" ? "2px solid rgba(255, 255, 255, 0.3)" : "2px solid rgba(0, 0, 0, 0.2)",
									background: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
									color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
									fontSize: "14px",
									outline: "none",
									marginBottom: "10px",
								}}
							/>

							{/* File Input */}
							<input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} style={{ display: "none" }} />
							<button
								onClick={() => fileInputRef.current?.click()}
								style={{
									width: "100%",
									padding: "12px 16px",
									borderRadius: "12px",
									border: theme === "dark" ? "2px solid rgba(255, 255, 255, 0.3)" : "2px solid rgba(0, 0, 0, 0.2)",
									background: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
									color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
									fontSize: "14px",
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
								{isCompressing ? Messages.STORY_COMPRESSING : selectedFile ? selectedFile.name : Messages.STORY_SELECT_FILE}
							</button>
							{mediaSize && (
								<p
									style={{
										marginTop: "8px",
										fontSize: "12px",
										color: theme === "dark" ? "var(--text-secondary-dark)" : "var(--text-secondary-light)",
									}}
								>
									{Messages.STORY_MEDIA_SIZE_LABEL}: {mediaSize}
								</p>
							)}
						</div>

						{/* Preview */}
						{previewUrl && (
							<div
								style={{
									width: "100%",
									borderRadius: "12px",
									overflow: "hidden",
									border: theme === "dark" ? "2px solid rgba(255, 255, 255, 0.2)" : "2px solid rgba(0, 0, 0, 0.2)",
								}}
							>
								{previewType === "video" ? (
									<video
										src={previewUrl}
										controls
										disablePictureInPicture
										controlsList="nodownload nofullscreen noremoteplayback"
										style={{
											width: "100%",
											height: "auto",
											maxHeight: "400px",
											objectFit: "contain",
										}}
										onError={() => {
											setPreviewUrl(null);
											setVideoUrl("");
										}}
									/>
								) : (
									<Image
										src={previewUrl}
										alt="Preview"
										width={400}
										height={300}
										quality={80}
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 400px"
										loading="lazy"
										style={{
											width: "100%",
											height: "auto",
											objectFit: "cover",
										}}
										unoptimized
										onError={() => {
											setPreviewUrl(null);
											setImageUrl("");
										}}
									/>
								)}
							</div>
						)}

						{/* Expires In Input */}
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "8px",
									fontSize: "14px",
									fontWeight: "500",
									color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
								}}
							>
								{Messages.STORY_EXPIRES_LABEL}
							</label>
							<input
								type="number"
								value={expiresIn}
								onChange={(e) => setExpiresIn(e.target.value)}
								placeholder={Messages.STORY_EXPIRES_PLACEHOLDER}
								min="-1"
								style={{
									width: "100%",
									padding: "12px 16px",
									borderRadius: "12px",
									border: theme === "dark" ? "2px solid rgba(255, 255, 255, 0.3)" : "2px solid rgba(0, 0, 0, 0.2)",
									background: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
									color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
									fontSize: "14px",
									outline: "none",
								}}
							/>
							<p
								style={{
									margin: "8px 0 0 0",
									fontSize: "12px",
									color: theme === "dark" ? "var(--text-secondary-dark)" : "var(--text-secondary-light)",
								}}
							>
								{Messages.STORY_EXPIRES_HELP}
							</p>
						</div>
					</div>

					{/* Buttons */}
					<div
						style={{
							display: "flex",
							gap: "15px",
							justifyContent: "center",
							marginTop: "30px",
							width: "100%",
						}}
					>
						<button
							onClick={handleClose}
							style={{
								padding: "12px 30px",
								borderRadius: "8px",
								background: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
								color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
								border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(0, 0, 0, 0.2)",
								fontSize: "16px",
								fontWeight: "500",
								cursor: "pointer",
								transition: "all 0.3s ease",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.opacity = "0.8";
								e.currentTarget.style.transform = "translateY(-2px)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.opacity = "1";
								e.currentTarget.style.transform = "translateY(0)";
							}}
						>
							{Messages.MODAL_CANCEL}
						</button>
						<button
							onClick={handleSave}
							disabled={isSaving || (!content.trim() && !imageUrl.trim() && !videoUrl.trim())}
							style={{
								padding: "12px 30px",
								borderRadius: "8px",
								background:
									isSaving || (!content.trim() && !imageUrl.trim() && !videoUrl.trim())
										? "rgba(59, 130, 246, 0.5)"
										: "var(--accent-blue)",
								color: "white",
								border: "none",
								fontSize: "16px",
								fontWeight: "500",
								cursor: isSaving || (!content.trim() && !imageUrl.trim() && !videoUrl.trim()) ? "not-allowed" : "pointer",
								transition: "all 0.3s ease",
								opacity: isSaving || (!content.trim() && !imageUrl.trim() && !videoUrl.trim()) ? 0.5 : 1,
							}}
							onMouseEnter={(e) => {
								if (!isSaving && (content.trim() || imageUrl.trim() || videoUrl.trim())) {
									e.currentTarget.style.transform = "translateY(-2px)";
									e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
								}
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = "translateY(0)";
								e.currentTarget.style.boxShadow = "none";
							}}
						>
							{isSaving ? Messages.STORY_COMPRESSING : Messages.MODAL_SAVE}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
