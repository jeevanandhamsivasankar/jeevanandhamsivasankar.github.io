import Icon from "../ui/Icon.jsx";
import { FOOTER_TEXT } from "../../config/site.js";

export default function Footer() {
  return (
    <footer>
      <Icon name="developer_board" size={14} />
      {FOOTER_TEXT}
      <Icon name="developer_board" size={14} />
    </footer>
  );
}
