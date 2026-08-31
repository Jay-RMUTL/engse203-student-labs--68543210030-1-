import RequestCard from './RequestCard.jsx';

function RequestList({ requests, onDeleteRequest, onMarkDone }) {
  if (requests.length === 0) return <p className="subtle-empty">ไม่มีคำร้องที่ตรงกับตัวกรองนี้</p>;
  return (
    <div className="request-list" data-testid="request-list">
      {requests.map((request, index) => (
        <RequestCard 
          key={request.id || index} 
          request={request} 
          onDeleteRequest={onDeleteRequest} 
          onMarkDone={onMarkDone} 
        />
      ))}
    </div>
  );
}

export default RequestList;