import { RequestStates, RequestStatesLabel, requestStatesToLabel } from "./RequestStates.enum";


describe('requestStatesToLabel', () => {
    it('should return the correct label for PENDING', () => {
        expect(requestStatesToLabel(RequestStates.PENDING)).toBe(RequestStatesLabel.PENDING);
    });

    it('should return the correct label for ACCEPTED', () => {
        expect(requestStatesToLabel(RequestStates.ACCEPTED)).toBe(RequestStatesLabel.ACCEPTED);
    });

    it('should return the correct label for EXPIRED', () => {
        expect(requestStatesToLabel(RequestStates.EXPIRED)).toBe(RequestStatesLabel.EXPIRED);
    });

    it('should return the correct label for CANCELLED', () => {
        expect(requestStatesToLabel(RequestStates.CANCELLED)).toBe(RequestStatesLabel.CANCELLED);
    });

    it('should return the correct label for REJECTED', () => {
        expect(requestStatesToLabel(RequestStates.REJECTED)).toBe(RequestStatesLabel.REJECTED);
    });

});