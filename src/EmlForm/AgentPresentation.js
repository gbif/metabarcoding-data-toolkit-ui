import React from "react";
import withContext from "../Components/hoc/withContext";
import _ from "lodash";
import { Button } from "antd";

const AgentPresentation = ({
  agent,
  countryAlpha2,
  style,
  noLinks,
  hideEmail,
  otherAgentTypes,
  reUseAgentAsOtherAgentType
}) => {
  const country = _.get(agent, "country", "");

  return agent ? (
    <span style={style}>
      {(agent.givenName || agent.surName) && (
        <span style={{ display: "block" }}>
          {[agent.surName, agent.givenName].filter((a) => !!a).join(", ")}
        </span>
      )}
      {agent.positionName && (
        <span style={{ display: "block" }}>{agent.positionName}</span>
      )}
      {agent.userId &&
        (noLinks ? (
          <div>
            <img
              src="/images/orcid_16x16.png"
              style={{ flex: "0 0 auto" }}
              alt=""
            ></img>{" "}
            {agent.userId}
          </div>
        ) : (
          <a
            style={{ display: "block" }}
            href={`https://orcid.org/${agent.userId}`}
          >
            <img
              src="/images/orcid_16x16.png"
              style={{ flex: "0 0 auto" }}
              alt=""
            ></img>{" "}
            {agent.userId}
          </a>
        ))}
        
      {agent.organizationName && (
        <span style={{ display: "block" }}>{agent.organizationName}</span>
      )}

{agent.deliveryPoint && (
        <span style={{ display: "block" }}>{agent.deliveryPoint}</span>
      )}
      {(agent.city || agent.administrativeArea || country) && (
        <span style={{ display: "block" }}>
          {[agent.city, agent.administrativeArea, country].filter((a) => !!a).join(", ")}
        </span>
      )}
      {agent.phone && (
        <span style={{ display: "block" }}>{agent.phone}</span>
      )}
      {agent.electronicMailAddress &&
        !hideEmail &&
        (noLinks ? (
          <div>{agent.electronicMailAddress}</div>
        ) : (
          <a style={{ display: "block" }} href={`mailto:${agent.electronicMailAddress}`}>
            {agent.electronicMailAddress}
          </a>
        ))}
      {agent?.role && (
        <span style={{ display: "block" }}>Role: {agent?.role}</span>
      )}

    </span>
  ) : null;
};

const mapContextToProps = ({ countryAlpha2 }) => ({
  countryAlpha2,
});

export default withContext(mapContextToProps)(AgentPresentation);
