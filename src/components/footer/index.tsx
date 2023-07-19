import { FireTwoTone } from "@ant-design/icons";
import { Typography } from "antd";

import "./styles.css";

export function Footer() {
  return (
    <footer className="Footer">
      <div className="Footer-content">
        <Typography.Text>
          Made with <FireTwoTone twoToneColor="#f49d37" /> by{" "}
          <Typography.Link href="https://mfarejowicz.github.io/" target="_blank">
            Matt Farejowicz
          </Typography.Link>
        </Typography.Text>
      </div>
    </footer>
  );
}
