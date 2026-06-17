import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { useAppSelector, useAppDispatch } from "../store/store-hooks";
import { dismissAlert } from "../store";

const slideDown = keyframes`from{transform:translateY(-100%)}to{transform:translateY(0)}`;

const BannerWrapper = styled.div`
  position: sticky;
  top: 70px; /* Below TopBar */
  left: 0; right: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Banner = styled.div`
  background: ${p => p.theme.amber + 'EE'};
  backdrop-filter: blur(8px);
  border-bottom: 1px solid ${p => p.theme.amber};
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: ${slideDown} 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
`;

const Message = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #000;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DismissBtn = styled.button`
  background: rgba(0,0,0,0.1);
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  &:hover { background: rgba(0,0,0,0.2); }
`;

export const AlertBanner = () => {
  const dispatch = useAppDispatch();
  const triggered = useAppSelector(s => s.alerts.triggeredAlerts);

  if (triggered.length === 0) return null;

  return (
    <BannerWrapper>
      {triggered.map(alert => (
        <Banner key={alert.alertId}>
          <Message>
            <span>⚠️</span>
            <span><b>{alert.campaignName}:</b> {alert.title}</span>
          </Message>
          <DismissBtn onClick={() => dispatch(dismissAlert(alert.alertId))}>
            Dismiss
          </DismissBtn>
        </Banner>
      ))}
    </BannerWrapper>
  );
};
