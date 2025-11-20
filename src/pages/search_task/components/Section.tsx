import { 
    Box, 
    Checkbox, 
    FormControlLabel, 
    FormGroup, 
    Paper, 
    Typography 
} from "@mui/material";
import { Opt } from "../../common/queries";

export default function Section({
  title,
  options,
  values,
  setValues,
}: {
  title: string;
  options: Opt[] | undefined;
  values: string[];
  setValues: (v: string[]) => void;
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Paper variant="outlined" sx={{ p: 1 }}>
        <FormGroup>
          {(options || []).length === 0 && (
            <Typography variant="caption" color="text.secondary">
              No options
            </Typography>
          )}
          {(options || []).map((opt) => {
            const checked = values.includes(opt.value);
            return (
              <FormControlLabel
                key={opt.value}
                control={
                  <Checkbox
                    size="small"
                    checked={checked}
                    onChange={(e) =>
                      setValues(e.target.checked ? [...values, opt.value] : values.filter((x) => x !== opt.value))
                    }
                  />
                }
                label={<Typography variant="body2">{opt.label}</Typography>}
              />
            );
          })}
        </FormGroup>
      </Paper>
    </Box>
  );
}
