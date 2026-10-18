const student = {
  name: "นรินทร์ ไสวจำเนียรกุล",
  studentId: "68543210030-1",
  os: process.platform,
  node: process.version,
};

function createGreeting({ name, studentId, os, node }) {
  return `Hello ${name} (${studentId}) | OS: ${os} | Node: ${node}`;
}

console.log(createGreeting(student));
