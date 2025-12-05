export class Messages {
  static readonly LOADING = "Loading...";
  static readonly SAVE_SUCCESS = "Lưu thành công!";
  static readonly SAVE_ERROR = "Lỗi khi lưu. Vui lòng thử lại.";
  static readonly DELETE_SUCCESS = "Xóa thành công!";
  static readonly DELETE_ERROR = "Lỗi khi xóa. Vui lòng thử lại.";
  static readonly UPDATE_SUCCESS = "Cập nhật thành công!";
  static readonly UPDATE_ERROR = "Lỗi khi cập nhật. Vui lòng thử lại.";

  static readonly STORY_EMPTY = "Chưa có tin tức nào";
  static readonly STORY_ADD_SUCCESS = "Thêm story thành công!";
  static readonly STORY_EDIT_SUCCESS = "Chỉnh sửa story thành công!";
  static readonly STORY_DELETE_SUCCESS = "Xóa story thành công!";
  static readonly STORY_NO_CONTENT =
    "Vui lòng nhập nội dung hoặc chọn ảnh/video";
  static readonly STORY_COMPRESSING = "Đang nén file...";
  static readonly STORY_COMPRESS_ERROR = "Lỗi khi nén file. Vui lòng thử lại.";
  static readonly STORY_TITLE = "Story";
  static readonly STORY_EDIT_TITLE = "Chỉnh sửa Story";
  static readonly STORY_MEDIA_LABEL = "Hình ảnh/Video (URL hoặc chọn file)";
  static readonly STORY_MEDIA_URL_PLACEHOLDER = "Nhập URL ảnh/video...";
  static readonly STORY_SELECT_FILE = "Chọn ảnh/video từ thiết bị";
  static readonly STORY_MEDIA_SIZE_LABEL = "Dung lượng";
  static readonly STORY_CREATED_AT_LABEL =
    "Thời gian tạo (DD/MM/YYYY-HH:mm:ss)";
  static readonly STORY_CREATED_AT_PLACEHOLDER = "DD/MM/YYYY-HH:mm:ss";
  static readonly STORY_CREATED_AT_HELP = "Ví dụ: 15/01/2025-14:30:00";
  static readonly STORY_EXPIRES_LABEL =
    "Thời gian hết hạn (giờ, -1 để không hết hạn)";
  static readonly STORY_EXPIRES_PLACEHOLDER = "24 hoặc -1";
  static readonly STORY_EXPIRES_HELP =
    "Ví dụ: 24 (hết hạn sau 24 giờ), -1 (không hết hạn)";
  static readonly STORY_PIN_LABEL = "Pin story lên đầu";
  static readonly STORY_DELETE_CONFIRM = "Bạn có chắc chắn muốn xóa story này?";

  static readonly AVATAR_UPLOAD_SUCCESS = "Tải ảnh đại diện thành công!";
  static readonly AVATAR_UPLOAD_ERROR = "Lỗi khi tải ảnh đại diện.";
  static readonly AVATAR_CROP_ERROR = "Lỗi khi crop ảnh. Vui lòng thử lại.";
  static readonly AVATAR_INVALID_URL = "URL ảnh không hợp lệ.";
  static readonly AVATAR_LOAD_ERROR =
    "Không thể tải ảnh. Vui lòng kiểm tra URL.";

  static readonly SOCIAL_ADD_SUCCESS = "Thêm mạng xã hội thành công!";
  static readonly SOCIAL_EDIT_SUCCESS = "Chỉnh sửa mạng xã hội thành công!";
  static readonly SOCIAL_DELETE_SUCCESS = "Xóa mạng xã hội thành công!";
  static readonly SOCIAL_NO_LINK = "Đường link không tồn tại";
  static readonly SOCIAL_EMPTY_TITLE = "Vui lòng nhập tiêu đề";
  static readonly SOCIAL_EMPTY_CONTENT = "Vui lòng nhập nội dung";
  static readonly SOCIAL_EMPTY_BUTTON_TEXT = "Vui lòng nhập text nút";

  static readonly INFO_EMPTY =
    "Chưa có thông tin nào. Vui lòng chỉnh sửa để thêm thông tin.";
  static readonly INFO_EMPTY_EDIT =
    'Chưa có thông tin nào. Nhấn "Thêm thông tin" bên dưới để bắt đầu.';
  static readonly INFO_ADD_SUCCESS = "Thêm thông tin thành công!";
  static readonly INFO_EDIT_SUCCESS = "Chỉnh sửa thông tin thành công!";
  static readonly INFO_DELETE_SUCCESS = "Xóa thông tin thành công!";
  static readonly INFO_EMPTY_LABEL = "Vui lòng nhập nhãn";
  static readonly INFO_EMPTY_VALUE = "Vui lòng nhập giá trị";
  static readonly INFO_BUTTON = "Click để xem thông tin";
  static readonly INFO_TITLE = "Thông tin cá nhân";
  static readonly INFO_EDIT_TITLE = "Chỉnh sửa thông tin";
  static readonly INFO_HIDDEN = "Thông tin bị ẩn";
  static readonly INFO_SHOW = "Hiện";
  static readonly INFO_HIDE = "Ẩn";
  static readonly INFO_SHOW_TOOLTIP = "Hiện thông tin";
  static readonly INFO_HIDE_TOOLTIP = "Ẩn thông tin";
  static readonly INFO_ITEM_NUMBER = (index: number) =>
    `Thông tin #${index + 1}`;
  static readonly INFO_LABEL = "Nhãn";
  static readonly INFO_TYPE = "Loại";
  static readonly INFO_VALUE = "Giá trị";
  static readonly INFO_CUSTOM_LINK = "Link tùy chỉnh (tùy chọn)";
  static readonly INFO_ADD_ITEM = "Thêm thông tin";
  static readonly INFO_LABEL_PLACEHOLDER = "Ví dụ: Email, Số điện thoại...";
  static readonly INFO_VALUE_PLACEHOLDER = "Nhập giá trị...";
  static readonly INFO_LINK_PLACEHOLDER = "Để trống để tự động tạo link";
  static readonly INFO_TYPE_EMAIL = "Email";
  static readonly INFO_TYPE_PHONE = "Số điện thoại";
  static readonly INFO_TYPE_WEBSITE = "Website";
  static readonly INFO_TYPE_ADDRESS = "Địa chỉ";
  static readonly INFO_TYPE_OTHER = "Khác";
  static readonly INFO_COPIED = "Đã sao chép";
  static readonly INFO_COPY_ERROR = "Lỗi khi sao chép";
  static readonly INFO_CONFIRM_PHONE = (phone: string) =>
    `Bạn có muốn gọi số ${phone}?`;
  static readonly INFO_CONFIRM_EMAIL = (email: string) =>
    `Bạn có muốn mở email đến ${email}?`;
  static readonly INFO_CONFIRM_WEBSITE = (url: string) =>
    `Bạn có muốn mở trang web ${url}?`;
  static readonly INFO_CONFIRM_ADDRESS = (address: string) =>
    `Bạn có muốn mở bản đồ cho địa chỉ ${address}?`;
  static readonly INFO_CONFIRM_LINK = (label: string) =>
    `Bạn có muốn mở ${label}?`;
  static readonly INFO_CONFIRM_YES = "Đồng ý";
  static readonly INFO_CONFIRM_NO = "Hủy";

  static readonly LOGIN_SUCCESS = "Đăng nhập thành công!";
  static readonly LOGIN_ERROR = "Sai tên đăng nhập hoặc mật khẩu.";
  static readonly LOGIN_ERROR_DETAIL =
    "Tên đăng nhập hoặc mật khẩu không đúng!";
  static readonly LOGIN_GENERAL_ERROR = "Có lỗi xảy ra. Vui lòng thử lại!";
  static readonly LOGIN_LOADING = "Đang đăng nhập...";
  static readonly LOGIN_BUTTON = "Đăng nhập";
  static readonly LOGIN_TITLE = "Đăng nhập Admin";
  static readonly LOGIN_SUBTITLE = "Vui lòng nhập thông tin đăng nhập";
  static readonly LOGIN_USERNAME_PLACEHOLDER = "Tên đăng nhập";
  static readonly LOGIN_PASSWORD_PLACEHOLDER = "Mật khẩu";
  static readonly LOGIN_SHOW_PASSWORD = "Hiện mật khẩu";
  static readonly LOGIN_HIDE_PASSWORD = "Ẩn mật khẩu";
  static readonly LOGOUT_CONFIRM = "Bạn có chắc muốn đăng xuất?";
  static readonly PASSWORD_CHANGE_SUCCESS = "Đổi mật khẩu thành công!";
  static readonly PASSWORD_CHANGE_SUCCESS_LOCAL =
    "Đổi mật khẩu thành công (chưa đồng bộ với server)";
  static readonly PASSWORD_CHANGE_ERROR = "Có lỗi xảy ra. Vui lòng thử lại.";
  static readonly PASSWORD_WRONG = "Mật khẩu hiện tại không đúng.";
  static readonly PASSWORD_MISMATCH = "Mật khẩu mới và xác nhận không khớp.";
  static readonly PASSWORD_EMPTY = "Vui lòng nhập đầy đủ thông tin.";
  static readonly PASSWORD_TOO_SHORT = "Mật khẩu phải có ít nhất 6 ký tự.";

  static readonly FILE_TOO_LARGE = (maxSize: string) =>
    `File quá lớn. Vui lòng chọn file nhỏ hơn ${maxSize}.`;
  static readonly FILE_INVALID_TYPE = "Loại file không được hỗ trợ.";
  static readonly FILE_UPLOAD_ERROR = "Lỗi khi tải file. Vui lòng thử lại.";
  static readonly FILE_COMPRESS_ERROR = "Lỗi khi nén file. Vui lòng thử lại.";
  static readonly VIDEO_TOO_LARGE = (maxSize: string) =>
    `Video quá lớn (${maxSize}). Vui lòng chọn video nhỏ hơn 10 MB hoặc nén trước khi upload.`;
  static readonly VIDEO_COMPRESS_ERROR = (attempts: number) =>
    `Không thể nén video xuống dưới 10 MB sau ${attempts} lần thử. Vui lòng chọn video nhỏ hơn.`;
  static readonly VIDEO_PROCESS_ERROR =
    "Lỗi khi xử lý video. Vui lòng thử lại.";

  static readonly MODAL_CLOSE = "Đóng";
  static readonly MODAL_CANCEL = "Hủy bỏ";
  static readonly MODAL_SAVE = "Lưu";
  static readonly MODAL_DELETE = "Xóa";
  static readonly MODAL_EDIT = "Chỉnh sửa";
  static readonly MODAL_ADD = "Thêm mới";
  static readonly MODAL_CONFIRM = "Xác nhận";
  static readonly MODAL_BACK = "Quay lại";
  static readonly MODAL_HOME = "Về trang chủ";

  static readonly PLACEHOLDER_CONTENT = "Nhập nội dung...";

  static readonly TIME_JUST_NOW = "Vừa xong";
  static readonly TIME_AGO = (unit: string) => `${unit} trước`;
  static readonly TIME_MINUTES = "phút";
  static readonly TIME_HOURS = "giờ";
  static readonly TIME_DAYS = "ngày";
  static readonly TIME_WEEKS = "tuần";
  static readonly TIME_MONTHS = "tháng";
  static readonly TIME_YEARS = "năm";

  static readonly BUTTON_VIEW_STORIES = "Xem Stories";
  static readonly BUTTON_ADD_STORY = "Thêm Story";
  static readonly BUTTON_CHANGE_PASSWORD = "Đổi mật khẩu";
  static readonly BUTTON_LOGOUT = "Đăng xuất";
  static readonly BUTTON_EDIT_STORY = "Chỉnh sửa story";
  static readonly BUTTON_DELETE_STORY = "Xóa story";
  static readonly STORY_EDIT_BUTTON = "Sửa";
  static readonly BUTTON_PERSONAL_INFO = "Thông tin cá nhân";
}
