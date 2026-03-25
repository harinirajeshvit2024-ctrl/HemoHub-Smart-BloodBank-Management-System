export default function HeaderBar({ title, color }) {
  return (
    <div style={{
      padding: "15px 30px",
      backgroundColor: color || "#8b0000",
      color: "white",
      fontWeight: "bold",
      fontSize: "20px",
      borderRadius: "8px",
      marginBottom: "20px"
    }}>
      {title}
    </div>
  );
}