import { useState } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { useCreateAlertMutation, useUpdateAlertMutation } from "../api/apiSlice";
import { IconButton } from "@adpulse/ui";
import type { Alert } from "../types";

const fadeIn = keyframes`from{opacity:0}to{opacity:1}`;
const slideUp = keyframes`from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease both;
`;

const Modal = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: ${p => p.theme.shadowMd};
  animation: ${slideUp} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${p => p.theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-family: ${p => p.theme.fontDisplay};
  font-size: 18px;
  font-weight: 700;
  color: ${p => p.theme.textPrimary};
  margin: 0;
`;

const Content = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const GridField = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Input = styled.input`
  background: ${p => p.theme.bg};
  border: 1px solid ${p => p.theme.border};
  border-radius: 8px;
  padding: 10px 12px;
  color: ${p => p.theme.textPrimary};
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  &:focus { border-color: ${p => p.theme.accent}; }
`;

const Select = styled.select`
  background: ${p => p.theme.bg};
  border: 1px solid ${p => p.theme.border};
  border-radius: 8px;
  padding: 10px 12px;
  color: ${p => p.theme.textPrimary};
  font-family: inherit;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  &:focus { border-color: ${p => p.theme.accent}; }
`;

const Footer = styled.div`
  padding: 16px 24px;
  background: ${p => p.theme.bg};
  border-top: 1px solid ${p => p.theme.border};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ variant?: 'primary' | 'ghost' }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${p => p.variant === 'primary' ? `
    background: ${p.theme.accent};
    color: white;
    border: none;
    &:hover { opacity: 0.9; transform: translateY(-1px); }
  ` : `
    background: transparent;
    color: ${p.theme.textSecondary};
    border: 1px solid ${p.theme.border};
    &:hover { background: ${p.theme.border}; }
  `}
`;

interface AlertModalProps {
  campaignId: string;
  onClose: () => void;
  editAlert?: Alert;
}

export const AlertModal = ({ campaignId, onClose, editAlert }: AlertModalProps) => {
  const [createAlert] = useCreateAlertMutation();
  const [updateAlert] = useUpdateAlertMutation();

  const [formData, setFormData] = useState({
    title: editAlert?.title || "",
    metric: editAlert?.metric || "spend_pct",
    operator: editAlert?.operator || "greater_than",
    threshold: editAlert ? (editAlert.metric === 'spend_pct' ? editAlert.threshold * 100 : editAlert.threshold) : 90,
    expiryAt: editAlert?.expiryAt ? new Date(editAlert.expiryAt).toISOString().slice(0, 16) : ""
  });

  const handleSubmit = async () => {
    if (!formData.title) return;
    
    // threshold logic: for spend_pct, 90 becomes 0.9
    const finalThreshold = formData.metric === 'spend_pct' ? formData.threshold / 100 : formData.threshold;

    // Ensure expiryAt is sent in a format backend (OffsetDateTime) can parse
    let finalExpiry = undefined;
    if (formData.expiryAt) {
      try {
        finalExpiry = new Date(formData.expiryAt).toISOString();
      } catch (e) {
        console.error("Invalid date format", e);
      }
    }

    const payload: Partial<Alert> = {
      campaignId,
      title: formData.title,
      metric: formData.metric as Alert["metric"],
      operator: formData.operator as Alert["operator"],
      threshold: finalThreshold,
      expiryAt: finalExpiry,
      isActive: editAlert ? editAlert.isActive : true
    };

    if (editAlert) {
      await updateAlert({ id: editAlert.id, data: payload }).unwrap();
    } else {
      await createAlert(payload).unwrap();
    }
    
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>{editAlert ? 'Edit' : 'Create'} Campaign Alert</Title>
          <IconButton onClick={onClose}>✕</IconButton>
        </Header>
        
        <Content>
          <Field>
            <Label>Alert Title</Label>
            <Input 
              placeholder="e.g. Critical Budget Warning" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </Field>
          
          <GridField>
            <Field>
              <Label>Metric</Label>
              <Select 
                value={formData.metric}
                onChange={e => setFormData({...formData, metric: e.target.value as Alert["metric"]})}
              >
                <option value="spend_pct">Spend %</option>
                <option value="ctr">CTR</option>
                <option value="clicks">Clicks</option>
                <option value="conversions">Conversions</option>
              </Select>
            </Field>
            
            <Field>
              <Label>Operator</Label>
              <Select 
                value={formData.operator}
                onChange={e => setFormData({...formData, operator: e.target.value as Alert["operator"]})}
              >
                <option value="greater_than">Is Greater Than</option>
                <option value="less_than">Is Less Than</option>
                <option value="equal_to">Is Equal To</option>
              </Select>
            </Field>
          </GridField>
          
          <Field>
            <Label>Threshold Value {formData.metric === 'spend_pct' ? '(%)' : ''}</Label>
            <Input 
              type="number"
              step={formData.metric === 'ctr' ? "0.01" : "1"}
              value={formData.threshold}
              onChange={e => setFormData({...formData, threshold: parseFloat(e.target.value)})}
            />
          </Field>

          <Field>
            <Label>Expiration (Optional)</Label>
            <Input 
              type="datetime-local"
              value={formData.expiryAt}
              onChange={e => setFormData({...formData, expiryAt: e.target.value})}
            />
          </Field>
        </Content>
        
        <Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{editAlert ? 'Update' : 'Create'} Alert</Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

