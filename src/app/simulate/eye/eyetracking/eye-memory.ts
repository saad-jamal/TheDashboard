/** The EyeMemory is an object that stores the relevent eye-tracking
 *  data for the eye tracking component.
 *
 * @author Saad Jamal
 */
export interface EyeMemory {
    object_being_viewed: number;
    confidence: number;
    x: number;
    y: number;
    empty_queue: boolean;
}