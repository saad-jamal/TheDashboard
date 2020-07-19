/* The MiscMemory is an object that stores the relevant sim data
 * variables for the Misc component.
 *
 * @author Saad Jamal
 */
export interface MiscMemory {
    throttle_1_pos: number;
    throttle_2_pos: number;
    flap_angle: number;
    spoiler_pos: number;
    mstr_caution: boolean;
    capt_ap_discon: boolean;
    fo_ap_discon: boolean;
    ap_caut_lt: boolean;
    ap_warn_lt: boolean;
    ap_discon_horn: boolean;
    alt_warn_horn: boolean;
    at_1_discon: boolean;
    at_2_discon: boolean;
    at_caut_lt: boolean;
    at_warn_lt: boolean;
    FMC_alert_lt: boolean;
    spd_brk_arm: boolean;
    spdbrk_ext_lt: boolean;
}