"""
    effects!(reference_grid::DataFrame, model::RegressionModel;
             eff_col=nothing, err_col=:err, typical=mean)

Compute the `effects` as specified in `formula`.

Effects are the model predictions made using values given via the reference
grid. For terms present in the model, but not in the reference grid, then
the typical value of those predictors is used. (In other words, effects are
conditional on the typical value.) The function for computing typical values
is specified via `typical`. Note that this is also applied to categorical contrasts,
thus yielding an average of the contrast, weighted by the balance of levels in the data
set used to fit the model.

By default, the column corresponding to the response variable in the formula
is overwritten with the effects, but an alternative column for the effects can
be specified by `eff_col`. Note that `eff_col` is determined first by trying
`StatsBase.responsename` and then falling back to the `string` representation
of the model's formula's left-hand side. For models with a transformed response,
whether in the original formula specification or via hints/contrasts, the name
will be the display name of the resulting term and not the original variable.
This convention also has the advantage of highlighting another aspect of the
underlying method: effects are computed on the scale of the transformed response.
If this column does not exist, it is created.
Pointwise standard errors are written into the column specified by `err_col`.

!!! note
    Effects are computed on the scale of the transformed response.
    For models with an explicit transformation, that transformation
    is the scale of the effects. For models with a link function,
    the scale of the effects is the _link_ scale, i.e. after
    application of the link function. For example, effects for
    logitistic regression models are on the logit and not the probability
    scale.

The reference grid must contain columns for all predictors in the formula.
(Interactions are computed automatically.) Contrasts must match the contrasts
used to fit the model; using other contrasts will lead to undefined behavior.

Interaction terms are computed in the same way for any regression model: as the
product of the lower-order terms. Typical values of lower terms thus propagate up
into the interaction term in the same way that any value would.

The use of typical values for excluded effects differs from other approaches
such as "partial effects" used in R packages like [`remef`](https://github.com/hohenstein/remef/).
The R package [`effects`](https://cran.r-project.org/web/packages/effects/)
is similar in approach, but due to differing languages and licenses,
no source code was inspected and there is no attempt at API compatibility or
even similarity.

The approach for computing effect is based on the effects plots described here:

Fox, John (2003). Effect Displays in R for Generalised Linear Models.
Journal of Statistical Software. Vol. 8, No. 15
"""
function effects!(reference_grid::DataFrame, model::RegressionModel;
                  eff_col=nothing, err_col=:err, typical=mean)
    # right now this is written for a RegressionModel and implicitly assumes
    # no link function and the existence of an appropriate formula method
    form = formula(model)
    form_typical = typify(reference_grid, form, modelmatrix(model); typical=typical)
    X = modelcols(form_typical, reference_grid)
    eff = X * coef(model)
    err = sqrt.(diag(X * vcov(model) * X'))
    reference_grid[!, something(eff_col, _responsename(model))] = eff
    reference_grid[!, err_col] = err
    return reference_grid
    # XXX remove DataFrames dependency
    # this doesn't work for a DataFrame and isn't mutating
    # return (; reference_grid..., depvar => eff, err_col => err)
end

function _reference_grid(design)
    colnames = tuple(keys(design)...)
    rowtab = NamedTuple{colnames}.(product(values(design)...))

    return DataFrame(vec(rowtab))
end

"""
    effects(design::AbstractDict, model::RegressionModel;
            eff_col=nothing, err_col=:err, typical=mean,
            lower_col=:lower, upper_col=:upper)

Compute the `effects` as specified by the `design`.

This is a convenience wrapper for [`effects!`](@ref). Instead of specifying a
reference grid, a dictionary containing the levels/values of each predictor
is specified. This is then expanded into a reference grid representing a
fully-crossed design. Additionally, two extra columns are created representing
the lower and upper edge of the error band (i.e. [resp-err, resp+err]).
"""
function effects(design::AbstractDict, model::RegressionModel;
                 eff_col=nothing, err_col=:err, typical=mean,
                 lower_col=:lower, upper_col=:upper)
    grid = _reference_grid(design)
    dv = something(eff_col, _responsename(model))
    effects!(grid, model; eff_col=dv, err_col=err_col, typical=typical)
    # XXX DataFrames dependency
    grid[!, lower_col] = grid[!, dv] - grid[!, err_col]
    grid[!, upper_col] = grid[!, dv] + grid[!, err_col]
    return grid
    # up_low = let dv = getproperty(reference_grid, dv), err = getproperty(reference_grid, err_col)
    #     (; lower_col => dv .- err, upper_col => dv .+ err)
    # end
    # return (; reference_grid..., up_low...)
end

function _responsename(model::RegressionModel)
    return try
        responsename(model)
    catch ex
        # why not specialize on MethodError here?
        # well StatsBase defines stubs for all functions in its API
        # that just use `error()`
        _responsename(formula(model))
    end
end

function _responsename(f::FormulaTerm)
    return string(f.lhs)
end
