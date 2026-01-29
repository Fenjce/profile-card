"use client";

import { useState, useEffect, useRef } from "react";
import { Story } from "@/lib/types";
import { formatDate, parseDate, normalizeStory } from "@/lib/utils";
import { compressImage } from "@/lib/imageUtils";
import { processVideo, getMediaSize } from "@/lib/mediaUtils";
import { Messages } from "@/lib/messages";
import { uploadToBlob, shouldUploadToBlob } from "@/lib/blobUtils";
import Image from "next/image";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface EditStoryModalProps {
	story: Story;
	onSave: (story: Story) => void;
	onClose: () => void;
	onDelete?: () => void | Promise<void>;
	theme: "light" | "dark";
	userName: string;
	userAvatar: string;
	showToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function EditStoryModal({ story, onSave, onClose, onDelete, theme, userName, userAvatar, showToast }: EditStoryModalProps) {
	const [isActive, setIsActive] = useState(false);
	const [content, setContent] = useState(story.content || "");
	const [imageUrl, setImageUrl] = useState(story.image || "");
	const [videoUrl, setVideoUrl] = useState(story.video || "");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
	const [mediaSize, setMediaSize] = useState<string>(story.mediaSize || "");
	const [createdAt, setCreatedAt] = useState("");
	const [isCompressing, setIsCompressing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [expiresIn, setExpiresIn] = useState<string>(story.expiresIn === -1 || story.expiresIn === null ? "-1" : String(story.expiresIn || 24));
	const [pinned, setPinned] = useState(story.pinned || false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => setIsActive(true), 10);
		return () => clearTimeout(timer);
	}, []);

	// Initialize createdAt from story
	useEffect(() => {
		const normalized = normalizeStory(story);
		if (normalized.createdAt) {
			const date = parseDate(normalized.createdAt);
			if (date) {
				setCreatedAt(formatDate(date));
			}
		}

		// Set preview URL and type
		if (story.video) {
			setPreviewUrl(story.video);
			setPreviewType("video");
			setVideoUrl(story.video);
		} else if (story.image) {
			setPreviewUrl(story.image);
			setPreviewType("image");
			setImageUrl(story.image);
		}

		// Set expiresIn and pinned
		setExpiresIn(story.expiresIn === -1 || story.expiresIn === null ? "-1" : String(story.expiresIn || 24));
		setPinned(story.pinned || false);
	}, [story]);

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
		if (isSaving) return; // Prevent double-click

		setIsSaving(true);
		try {
			// Validate time
			const now = new Date();
			let finalCreatedAt = createdAt.trim();

			if (finalCreatedAt) {
				const parsedDate = parseDate(finalCreatedAt);
				if (parsedDate) {
					// Check if time is in the future
					if (parsedDate > now) {
						if (showToast) {
							showToast("Thời gian tạo không được vượt quá thời gian hiện tại. Đã tự động đặt về thời gian hiện tại.", "error");
						}
						// Set to current time
						finalCreatedAt = formatDate(now);
						setCreatedAt(finalCreatedAt);
						setIsSaving(false);
						return;
					}

					// Check if time is too old with expiration
					const expiresInValue = expiresIn.trim() === "" || expiresIn.trim() === "-1" ? -1 : parseInt(expiresIn.trim(), 10);

					if (expiresInValue > 0) {
						const expirationTime = new Date(parsedDate.getTime() + expiresInValue * 60 * 60 * 1000);
						if (expirationTime < now) {
							if (showToast) {
								showToast(`Story với thời gian này đã hết hạn (${expiresInValue}h). Đã tự động đặt về thời gian hiện tại.`, "error");
							}
							finalCreatedAt = formatDate(now);
							setCreatedAt(finalCreatedAt);
							setIsSaving(false);
							return;
						}
					}
				}
			}

			let finalImageUrl = imageUrl.trim() || undefined;
			let finalVideoUrl = videoUrl?.trim() || undefined;

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

			// Xử lý expiresIn: nếu là -1 hoặc rỗng thì để -1 (không hết hạn)
			let expiresInValue = -1;
			const trimmedExpiresIn = expiresIn.trim();
			if (trimmedExpiresIn !== "" && trimmedExpiresIn !== "-1") {
				const parsed = parseInt(trimmedExpiresIn, 10);
				expiresInValue = isNaN(parsed) ? 24 : parsed;
			}

			const updatedStory: Story = {
				...story,
				// author và avatar không lưu, tự động lấy từ config.user
				content: content.trim() || undefined,
				image: finalImageUrl,
				video: finalVideoUrl,
				expiresIn: expiresInValue,
				pinned: pinned,
			};

			// Loại bỏ author và avatar nếu có (để đảm bảo không lưu vào JSON)
			delete (updatedStory as any).author;
			delete (updatedStory as any).avatar;

			if (finalCreatedAt) {
				const parsedDate = parseDate(finalCreatedAt);
				if (parsedDate) {
					updatedStory.createdAt = formatDate(parsedDate);
					delete updatedStory.hoursAgo;
					delete updatedStory.daysAgo;
					delete updatedStory.minutesAgo;
				}
			}

			onSave(updatedStory);
			onClose();
		} catch (error) {
			console.error("Save error:", error);
			setIsSaving(false);
		}
	};

	return (
		<div className={`story-overlay ${isActive ? "active" : ""}`} style={{ zIndex: 2000 }}>
			<div className="story-container" ref={scrollContainerRef}>
				<button className="story-close-btn" onClick={onClose} title={Messages.MODAL_HOME}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
						<polyline points="9 22 9 12 15 12 15 22"></polyline>
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

				<div
					style={{
						display: "flex",
						flexDirection: "column",
					}}
				>
					<h2
						style={{
							color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
							fontSize: "20px",
							marginBottom: "20px",
							textAlign: "center",
						}}
					>
						{Messages.STORY_EDIT_TITLE}
					</h2>

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

						{/* Created At Input */}
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
								Thời gian tạo
							</label>
							<input
								type="datetime-local"
								value={
									createdAt
										? (() => {
												const date = parseDate(createdAt);
												if (date) {
													// Convert to YYYY-MM-DDTHH:mm format for datetime-local
													const year = date.getFullYear();
													const month = String(date.getMonth() + 1).padStart(2, "0");
													const day = String(date.getDate()).padStart(2, "0");
													const hours = String(date.getHours()).padStart(2, "0");
													const minutes = String(date.getMinutes()).padStart(2, "0");
													return `${year}-${month}-${day}T${hours}:${minutes}`;
												}
												return "";
											})()
										: ""
								}
								onChange={(e) => {
									const value = e.target.value;
									if (value) {
										// Convert from YYYY-MM-DDTHH:mm to Date
										const date = new Date(value);
										setCreatedAt(formatDate(date));
									} else {
										setCreatedAt("");
									}
								}}
								style={{
									width: "100%",
									padding: "10px 12px",
									borderRadius: "12px",
									border: theme === "dark" ? "2px solid rgba(255, 255, 255, 0.3)" : "2px solid rgba(0, 0, 0, 0.2)",
									background: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
									color: theme === "dark" ? "var(--text-primary-dark)" : "var(--text-primary-light)",
									fontSize: "13px",
									outline: "none",
									colorScheme: theme === "dark" ? "dark" : "light",
									maxWidth: "100%",
									boxSizing: "border-box",
								}}
							/>
						</div>

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
								Hết hạn (giờ)
							</label>
							<input
								type="number"
								value={expiresIn}
								onChange={(e) => setExpiresIn(e.target.value)}
								placeholder="-1 = không hết hạn"
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
						{onDelete && (
							<button
								onClick={() => setShowDeleteConfirm(true)}
								style={{
									padding: "12px 30px",
									borderRadius: "8px",
									background: theme === "dark" ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.1)",
									color: theme === "dark" ? "white" : "#ef4444",
									border: theme === "dark" ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(239, 68, 68, 0.3)",
									fontSize: "16px",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.3s ease",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.opacity = "0.8";
									e.currentTarget.style.transform = "translateY(-2px)";
									e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.opacity = "1";
									e.currentTarget.style.transform = "translateY(0)";
									e.currentTarget.style.boxShadow = "none";
								}}
							>
								{Messages.MODAL_DELETE}
							</button>
						)}
						<button
							onClick={onClose}
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
							disabled={isSaving}
							style={{
								padding: "12px 30px",
								borderRadius: "8px",
								background: isSaving ? "rgba(59, 130, 246, 0.5)" : "var(--accent-blue)",
								color: "white",
								border: "none",
								fontSize: "16px",
								fontWeight: "500",
								cursor: isSaving ? "not-allowed" : "pointer",
								transition: "all 0.3s ease",
								opacity: isSaving ? 0.6 : 1,
							}}
							onMouseEnter={(e) => {
								if (!isSaving) {
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

			<ConfirmDialog
				isOpen={showDeleteConfirm}
				message={Messages.STORY_DELETE_CONFIRM}
				confirmText="Xóa"
				cancelText="Huỷ"
				onConfirm={async () => {
					if (onDelete) {
						await onDelete();
						if (showToast) {
							showToast("Đã xóa story", "success");
						}
						onClose();
					}
					setShowDeleteConfirm(false);
				}}
				onCancel={() => setShowDeleteConfirm(false)}
				theme={theme}
			/>
		</div>
	);
}
