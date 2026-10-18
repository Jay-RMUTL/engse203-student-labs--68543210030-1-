import './style.css';

const form = document.querySelector('#request-form');
const nameInput = document.querySelector('#requester-name');
const typeInput = document.querySelector('#request-type');
const detailsInput = document.querySelector('#request-details');
const status = document.querySelector('#form-status');
const characterCount = document.querySelector('#character-count');
const requestList = document.querySelector('#request-list');
const requestCount = document.querySelector('#request-count');

const preview = {
  name: document.querySelector('#preview-name'),
  type: document.querySelector('#preview-type'),
  details: document.querySelector('#preview-details'),
};

const fields = [
  {
    input: nameInput,
    error: document.querySelector('#name-error'),
    validate(value) {
      if (!value.trim()) return 'กรุณากรอกชื่อผู้แจ้ง';
      if (value.trim().length < 2) return 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร';
      if (value.length > 80) return 'ชื่อต้องไม่เกิน 80 ตัวอักษร';
      return '';
    },
  },
  {
    input: typeInput,
    error: document.querySelector('#type-error'),
    validate(value) {
      return value ? '' : 'กรุณาเลือกประเภทคำขอ';
    },
  },
  {
    input: detailsInput,
    error: document.querySelector('#details-error'),
    validate(value) {
      if (!value.trim()) return 'กรุณากรอกรายละเอียด';
      if (value.trim().length < 10) return 'รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร';
      if (value.length > 500) return 'รายละเอียดต้องไม่เกิน 500 ตัวอักษร';
      return '';
    },
  },
];

let submittedRequests = [];

function readForm() {
  return {
    name: nameInput.value,
    type: typeInput.value,
    details: detailsInput.value,
  };
}

function renderPreview(data) {
  preview.name.textContent = data.name.trim() || 'ยังไม่ระบุชื่อ';
  preview.type.textContent =
    typeInput.selectedIndex > 0
      ? typeInput.options[typeInput.selectedIndex].text
      : 'ยังไม่เลือกประเภท';
  preview.details.textContent = data.details.trim() || 'ยังไม่มีรายละเอียด';
  characterCount.textContent = `${data.details.length}/500`;
}

function validate(data) {
  return fields.map((field) => ({
    ...field,
    message: field.validate(
      field.input === nameInput
        ? data.name
        : field.input === typeInput
          ? data.type
          : data.details,
    ),
  }));
}

function renderErrors(results) {
  results.forEach(({ input, error, message }) => {
    error.textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
    input.classList.toggle('invalid', Boolean(message));
  });
}

function renderRequests() {
  requestList.replaceChildren();
  requestCount.textContent = `${submittedRequests.length} รายการ`;

  if (submittedRequests.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'ยังไม่มีคำขอ ลองส่งคำขอแรกของคุณ';
    requestList.append(empty);
    return;
  }

  submittedRequests.forEach((request, index) => {
    const item = document.createElement('li');
    item.className = 'request-item';

    const heading = document.createElement('h4');
    heading.textContent = `${index + 1}. ${request.name}`;

    const category = document.createElement('p');
    category.className = 'request-category';
    category.textContent = request.typeLabel;

    const description = document.createElement('p');
    description.textContent = request.details;

    item.append(heading, category, description);
    requestList.append(item);
  });
}

function clearStatus() {
  status.textContent = '';
  status.className = 'status';
}

form.addEventListener('input', () => {
  renderPreview(readForm());
  clearStatus();
});

form.addEventListener('change', () => {
  renderPreview(readForm());
  clearStatus();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = readForm();
  const results = validate(data);
  renderErrors(results);

  const firstInvalid = results.find((result) => result.message);

  if (firstInvalid) {
    status.textContent = 'กรุณาตรวจสอบข้อมูลที่ระบุไว้ก่อนส่งคำขอ';
    status.className = 'status status-error';
    firstInvalid.input.focus();
    return;
  }

  const selectedOption = typeInput.options[typeInput.selectedIndex];

  submittedRequests.unshift({
    name: data.name.trim(),
    type: data.type,
    typeLabel: selectedOption.text,
    details: data.details.trim(),
  });

  renderRequests();
  status.textContent = 'ส่งคำขอเรียบร้อยแล้ว';
  status.className = 'status status-success';

  form.reset();
  fields.forEach(({ input, error }) => {
    error.textContent = '';
    input.setAttribute('aria-invalid', 'false');
    input.classList.remove('invalid');
  });
  renderPreview(readForm());
});

fields.forEach(({ input }) => {
  input.setAttribute('aria-invalid', 'false');

  input.addEventListener('blur', () => {
    const field = fields.find((item) => item.input === input);
    const message = field.validate(input.value);
    field.error.textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
    input.classList.toggle('invalid', Boolean(message));
  });
});

renderPreview(readForm());
renderRequests();
